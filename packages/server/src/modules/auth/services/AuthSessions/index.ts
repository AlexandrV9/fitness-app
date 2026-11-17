import { createHash } from "node:crypto";

import { isUuid } from "../../../../shared/lib/guards.js";
import { InvalidRefreshTokenException } from "../../domain/exceptions/InvalidRefreshTokenException.js";

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
    const tokens = await this.tokens.generateTokens(user);

    await this.refreshSessionsRepository.createRefreshSession(
      user.id,
      generateHashToken(tokens.refreshToken),
      this.getHashRefreshTokenExpiresAt(),
    );
    return tokens;
  }

  async refresh(refreshToken: string) {
    const verified = await this.tokens.verifyRefreshToken(refreshToken);
    if (!verified.success) {
      throw new InvalidRefreshTokenException();
    }

    const user = verified.payload.data;
    const { id: userId, login } = user;

    if (!isUuid(userId) || typeof login !== "string") {
      throw new InvalidRefreshTokenException();
    }

    const tokens = await this.tokens.generateTokens(user);

    const rotated = await this.refreshSessionsRepository.updateRefreshTokenHash(
      userId,
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
    await this.refreshSessionsRepository.revokeRefreshSession(generateHashToken(refreshToken));
  }

  private getHashRefreshTokenExpiresAt(): Date {
    return new Date(Date.now() + this.refreshTokenTtlSec * 1000);
  }
}
