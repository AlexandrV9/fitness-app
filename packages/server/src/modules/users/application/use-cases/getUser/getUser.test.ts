import { beforeEach, describe, expect, it } from "vitest";

import { UserNotFoundException } from "../../../domain/exceptions/index.js";
import { createUsersRepositoryMock } from "../../../testing/createUsersRepositoryMock.js";
import { GetUserUseCase } from "./index.js";

import type { IUser } from "../../../domain/interfaces/IUser.js";

describe("GetUserUseCase", () => {
  const repository = createUsersRepositoryMock();
  const useCase = new GetUserUseCase(repository);

  const user: IUser = {
    id: "11111111-1111-1111-1111-111111111111",
    login: "athlete",
  };

  beforeEach(() => {
    repository.getUserById.mockReset();
  });

  it("Возвращает пользователя по id", async () => {
    repository.getUserById.mockResolvedValue(user);

    await expect(useCase.execute(user.id)).resolves.toEqual(user);
    expect(repository.getUserById).toHaveBeenCalledExactlyOnceWith(user.id);
  });

  it("Бросает UserNotFoundException, если пользователь не найден", async () => {
    repository.getUserById.mockResolvedValue(null);

    await expect(useCase.execute(user.id)).rejects.toThrow(UserNotFoundException);
  });
});
