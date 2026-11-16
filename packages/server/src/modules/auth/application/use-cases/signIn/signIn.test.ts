import { beforeEach, describe, expect, it } from "vitest";

import { createJwtAuthTokenManagerMock } from "../../../testing/createJwtAuthTokenManagerMock.js";
import { createPasswordHasherMock } from "../../../../users/testing/createPasswordHasherMock.js";
import { createUsersRepositoryMock } from "../../../../users/testing/createUsersRepositoryMock.js";
import { InvalidCredentialsException } from "../../../domain/exceptions/InvalidCredentialsException.js";
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
  const jwtAuthTokenManager = createJwtAuthTokenManagerMock();
  const useCase = new SignInUseCase(usersRepository, passwordHasher, jwtAuthTokenManager);

  beforeEach(() => {
    usersRepository.findAuthByLogin.mockReset();
    passwordHasher.verify.mockReset();
    jwtAuthTokenManager.generateTokens.mockReset();

    usersRepository.findAuthByLogin.mockResolvedValue(authUser);
    passwordHasher.verify.mockResolvedValue(true);
    jwtAuthTokenManager.generateTokens.mockResolvedValue(tokens);
  });

  it("выдаёт токены при верных credentials", async () => {
    const result = await useCase.execute({
      login: " Alice ",
      password: "password1",
    });

    expect(passwordHasher.verify).toHaveBeenCalledExactlyOnceWith("password1", "password-hash");
    expect(jwtAuthTokenManager.generateTokens).toHaveBeenCalledExactlyOnceWith({
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
