import { UserAlreadyExistsException } from "../../../../users/domain/exceptions/UserAlreadyExistsException.js";
import { WeakPasswordException } from "../../../domain/exceptions/WeakPasswordException.js";

import type { IPasswordHasher } from "../../../../users/domain/interfaces/IPasswordHasher.js";
import type { IUsersRepository } from "../../../../users/domain/interfaces/IUsersRepository.js";
import type {
  AuthUserPayload,
  IJwtAuthTokenManager,
} from "../../../domain/interfaces/IJwtAuthTokenManager.js";

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
    private readonly jwtAuthTokenManager: IJwtAuthTokenManager,
  ) {}

  async execute(request: SignUpRequest): Promise<SignUpResponse> {
    if (request.password.length < MIN_PASSWORD_LENGTH) {
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
    const tokens = await this.jwtAuthTokenManager.generateTokens(user);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user,
    };
  }
}
