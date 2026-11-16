import { beforeEach, describe, expect, it } from "vitest";

import { createJwtAuthTokenManagerMock } from "../../../testing/createJwtAuthTokenManagerMock.js";
import { UserAlreadyExistsException } from "../../../../users/domain/exceptions/UserAlreadyExistsException.js";
import { createPasswordHasherMock } from "../../../../users/testing/createPasswordHasherMock.js";
import { createUsersRepositoryMock } from "../../../../users/testing/createUsersRepositoryMock.js";
import { WeakPasswordException } from "../../../domain/exceptions/WeakPasswordException.js";
import { SignUpUseCase } from "./index.js";

describe("SignUpUseCase", () => {
  const tokens = { accessToken: "access", refreshToken: "refresh" };
  const usersRepository = createUsersRepositoryMock();
  const passwordHasher = createPasswordHasherMock();
  const jwtAuthTokenManager = createJwtAuthTokenManagerMock();
  const useCase = new SignUpUseCase(usersRepository, passwordHasher, jwtAuthTokenManager);

  beforeEach(() => {
    usersRepository.createUser.mockReset();
    usersRepository.findByLogin.mockReset();
    passwordHasher.hash.mockReset();
    jwtAuthTokenManager.generateTokens.mockReset();

    usersRepository.findByLogin.mockResolvedValue(null);
    usersRepository.createUser.mockResolvedValue({ id: "user-1", login: "alice" });
    passwordHasher.hash.mockResolvedValue("password-hash");
    jwtAuthTokenManager.generateTokens.mockResolvedValue(tokens);
  });

  it("создаёт пользователя и выдаёт токены", async () => {
    const result = await useCase.execute({
      login: " Alice ",
      password: "password1",
    });

    expect(passwordHasher.hash).toHaveBeenCalledExactlyOnceWith("password1");
    expect(usersRepository.createUser).toHaveBeenCalledExactlyOnceWith({
      login: "alice",
      passwordHash: "password-hash",
    });
    expect(jwtAuthTokenManager.generateTokens).toHaveBeenCalledExactlyOnceWith({
      id: "user-1",
      login: "alice",
    });
    expect(result).toEqual({
      ...tokens,
      user: { id: "user-1", login: "alice" },
    });
  });

  it("бросает ошибку, если логин уже занят", async () => {
    usersRepository.findByLogin.mockResolvedValue({ id: "user-1", login: "alice" });

    await expect(useCase.execute({ login: "alice", password: "password1" })).rejects.toThrow(
      UserAlreadyExistsException,
    );
  });

  it("бросает ошибку при слабом пароле", async () => {
    await expect(useCase.execute({ login: "alice", password: "short" })).rejects.toThrow(
      WeakPasswordException,
    );
  });
});
