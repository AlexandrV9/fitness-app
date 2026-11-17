import { beforeEach, describe, expect, it } from "vitest";

import { createPasswordHasherMock } from "~/modules/users/testing/createPasswordHasherMock.js";
import { createUsersRepositoryMock } from "~/modules/users/testing/createUsersRepositoryMock.js";

import { InvalidCredentialsException } from "../../../domain/exceptions/index.js";
import { createAuthSessionsServiceMock } from "../../../testing/createAuthSessionsServiceMock.js";
import { SignInUseCase } from "./index.js";

describe("SignInUseCase", () => {
  const tokens = { accessToken: "access", refreshToken: "refresh" };
  const authUser = {
    id: "user-1",
    login: "alice",
    passwordHash: "password-hash",
  };

  const usersRepository = createUsersRepositoryMock();
  const passwordHasher = createPasswordHasherMock();
  const authSessionsService = createAuthSessionsServiceMock();
  const useCase = new SignInUseCase(usersRepository, passwordHasher, authSessionsService);

  beforeEach(() => {
    usersRepository.findAuthByLogin.mockReset();
    passwordHasher.verify.mockReset();
    authSessionsService.createUserSession.mockReset();

    usersRepository.findAuthByLogin.mockResolvedValue(authUser);
    passwordHasher.verify.mockResolvedValue(true);
    authSessionsService.createUserSession.mockResolvedValue(tokens);
  });

  it("выдаёт токены при верных credentials", async () => {
    const result = await useCase.execute({
      login: " Alice ",
      password: "password1",
    });

    expect(passwordHasher.verify).toHaveBeenCalledExactlyOnceWith("password1", "password-hash");
    expect(authSessionsService.createUserSession).toHaveBeenCalledExactlyOnceWith({
      id: "user-1",
      login: "alice",
    });
    expect(result).toEqual({
      ...tokens,
      user: { id: "user-1", login: "alice" },
    });
  });

  it("бросает одну ошибку, если пользователь не найден", async () => {
    usersRepository.findAuthByLogin.mockResolvedValue(null);

    await expect(useCase.execute({ login: "alice", password: "password1" })).rejects.toThrow(
      InvalidCredentialsException,
    );
  });

  it("бросает одну ошибку, если пароль неверный", async () => {
    passwordHasher.verify.mockResolvedValue(false);

    await expect(useCase.execute({ login: "alice", password: "wrong-password" })).rejects.toThrow(
      InvalidCredentialsException,
    );
  });
});
