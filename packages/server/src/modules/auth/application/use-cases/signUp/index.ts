import { UserAlreadyExistsException } from "~/modules/users/domain/exceptions/index.js";
import { BCRYPT_MAX_PASSWORD_BYTES } from "~/modules/users/domain/passwordLimits.js";

import { WeakPasswordException } from "../../../domain/exceptions/index.js";

import type { IPasswordHasher } from "~/modules/users/domain/interfaces/IPasswordHasher.js";
import type { IUsersRepository } from "~/modules/users/domain/interfaces/IUsersRepository.js";

import type { IAuthSessionsService } from "../../../domain/interfaces/IAuthSessionsService.js";
import type { AuthUserPayload } from "../../../domain/interfaces/IJwtAuthTokenManager.js";

const MIN_PASSWORD_LENGTH = 8;

export type SignUpRequest = {
  login: string;
  password: string;
};

export type SignUpResponse = {
  accessToken: string;
  refreshToken: string;
  user: AuthUserPayload;
};

export class SignUpUseCase {
  constructor(
    private readonly usersRepository: IUsersRepository,
    private readonly passwordHasher: IPasswordHasher,
    private readonly authSessionsService: IAuthSessionsService,
  ) {}

  async execute(request: SignUpRequest): Promise<SignUpResponse> {
    if (
      request.password.length < MIN_PASSWORD_LENGTH ||
      Buffer.byteLength(request.password, "utf8") > BCRYPT_MAX_PASSWORD_BYTES
    ) {
      throw new WeakPasswordException();
    }

    const login = request.login.trim().toLowerCase();

    const existing = await this.usersRepository.findByLogin(login);
    if (existing) {
      throw new UserAlreadyExistsException(login);
    }

    const passwordHash = await this.passwordHasher.hash(request.password);
    const created = await this.usersRepository.createUser({ login, passwordHash });

    if (!created) {
      throw new UserAlreadyExistsException(login);
    }

    const user: AuthUserPayload = { id: created.id, login: created.login };
    const tokens = await this.authSessionsService.createUserSession(user);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user,
    };
  }
}
