import { InvalidCredentialsException } from "../../../domain/exceptions/InvalidCredentialsException.js";

import type { IPasswordHasher } from "../../../../users/domain/interfaces/IPasswordHasher.js";
import type { IUsersRepository } from "../../../../users/domain/interfaces/IUsersRepository.js";
import type {
  AuthUserPayload,
  IJwtAuthTokenManager,
} from "../../../domain/interfaces/IJwtAuthTokenManager.js";

export type SignInRequest = {
  login: string;
  password: string;
};

export type SignInResponse = {
  accessToken: string;
  refreshToken: string;
  user: AuthUserPayload;
};

export class SignInUseCase {
  constructor(
    private readonly usersRepository: IUsersRepository,
    private readonly passwordHasher: IPasswordHasher,
    private readonly jwtAuthTokenManager: IJwtAuthTokenManager,
  ) {}

  async execute(request: SignInRequest): Promise<SignInResponse> {
    const login = request.login.trim().toLowerCase();
    const authUser = await this.usersRepository.findAuthByLogin(login);

    if (!authUser) {
      throw new InvalidCredentialsException();
    }

    const isValid = await this.passwordHasher.verify(request.password, authUser.passwordHash);
    if (!isValid) {
      throw new InvalidCredentialsException();
    }

    const user: AuthUserPayload = { id: authUser.id, login: authUser.login };
    const tokens = await this.jwtAuthTokenManager.generateTokens(user);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user,
    };
  }
}
