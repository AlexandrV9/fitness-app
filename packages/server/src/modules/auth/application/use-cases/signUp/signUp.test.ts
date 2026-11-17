import { beforeEach, describe, expect, it } from "vitest";

import { UserAlreadyExistsException } from "~/modules/users/domain/exceptions/UserAlreadyExistsException.js";
import { createPasswordHasherMock } from "~/modules/users/testing/createPasswordHasherMock.js";
import { createUsersRepositoryMock } from "~/modules/users/testing/createUsersRepositoryMock.js";
import { WeakPasswordException } from "../../../domain/exceptions/WeakPasswordException.js";
import { createAuthSessionsServiceMock } from "../../../testing/createAuthSessionsServiceMock.js";
import { SignUpUseCase } from "./index.js";

describe("SignUpUseCase", () => {
  const tokens = { accessToken: "access", refreshToken: "refresh" };
  const usersRepository = createUsersRepositoryMock();
  const passwordHasher = createPasswordHasherMock();
  const authSessionsService = createAuthSessionsServiceMock();
  const useCase = new SignUpUseCase(usersRepository, passwordHasher, authSessionsService);

  beforeEach(() => {
    usersRepository.createUser.mockReset();
    usersRepository.findByLogin.mockReset();
    passwordHasher.hash.mockReset();
    authSessionsService.createUserSession.mockReset();

    usersRepository.findByLogin.mockResolvedValue(null);
    usersRepository.createUser.mockResolvedValue({ id: "user-1", login: "alice" });
    passwordHasher.hash.mockResolvedValue("password-hash");
    authSessionsService.createUserSession.mockResolvedValue(tokens);
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
    expect(authSessionsService.createUserSession).toHaveBeenCalledExactlyOnceWith({
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

  it("отклоняет пароль длиннее 72 байт до хеширования", async () => {
    await expect(useCase.execute({ login: "alice", password: "я".repeat(37) })).rejects.toThrow(
      WeakPasswordException,
    );

    expect(passwordHasher.hash).not.toHaveBeenCalled();
  });
});
