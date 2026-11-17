import { createHash, randomUUID } from "node:crypto";

import { isUuid } from "~/shared/lib/guards.js";

import { InvalidRefreshTokenException } from "../../domain/exceptions/index.js";

import type { IAuthSessionsService } from "../../domain/interfaces/IAuthSessionsService.js";
import type {
  AuthUserPayload,
  GenerateTokensResponse,
  IJwtAuthTokenManager,
} from "../../domain/interfaces/IJwtAuthTokenManager.js";
import type { IRefreshSessionsRepository } from "../../domain/interfaces/IRefreshSessionsRepository.js";

function generateHashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export class AuthSessionsService implements IAuthSessionsService {
  constructor(
    private readonly tokens: IJwtAuthTokenManager,
    private readonly refreshSessionsRepository: IRefreshSessionsRepository,
    private readonly refreshTokenTtlSec: number,
  ) {}

  async createUserSession(user: AuthUserPayload): Promise<GenerateTokensResponse> {
    const sessionId = randomUUID();
    const tokens = await this.tokens.generateTokens(user, sessionId);

    await this.refreshSessionsRepository.createRefreshSession(
      sessionId,
      user.id,
      generateHashToken(tokens.refreshToken),
      this.getHashRefreshTokenExpiresAt(),
    );
    return tokens;
  }

  async refresh(refreshToken: string) {
    const payload = await this.getRefreshPayload(refreshToken);
    if (!payload) {
      throw new InvalidRefreshTokenException();
    }

    const { data: user, sid } = payload;
    const tokens = await this.tokens.generateTokens(user, sid);
    const rotated = await this.refreshSessionsRepository.updateRefreshTokenHash(
      user.id,
      generateHashToken(refreshToken),
      generateHashToken(tokens.refreshToken),
      this.getHashRefreshTokenExpiresAt(),
    );

    if (!rotated) {
      throw new InvalidRefreshTokenException();
    }

    return { ...tokens, user };
  }

  async logout(refreshToken: string): Promise<void> {
    const payload = await this.getRefreshPayload(refreshToken);
    if (!payload) return;

    await this.refreshSessionsRepository.revokeRefreshSession(payload.data.id, payload.sid);
  }

  private async getRefreshPayload(token: string) {
    const verified = await this.tokens.verifyRefreshToken(token);
    if (!verified.success) {
      return null;
    }

    const { data: user, sid } = verified.payload;
    if (!isUuid(user?.id) || typeof user.login !== "string" || !isUuid(sid)) {
      return null;
    }

    return { data: user, sid };
  }

  private getHashRefreshTokenExpiresAt(): Date {
    return new Date(Date.now() + this.refreshTokenTtlSec * 1000);
  }
}
