import { InvalidCredentialsException } from "../../../domain/exceptions/index.js";

import type { IPasswordHasher } from "~/modules/users/domain/interfaces/IPasswordHasher.js";
import type { IUsersRepository } from "~/modules/users/domain/interfaces/IUsersRepository.js";

import type { IAuthSessionsService } from "../../../domain/interfaces/IAuthSessionsService.js";
import type { AuthUserPayload } from "../../../domain/interfaces/IJwtAuthTokenManager.js";

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
    private readonly authSessionsService: IAuthSessionsService,
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
    const tokens = await this.authSessionsService.createUserSession(user);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user,
    };
  }
}
