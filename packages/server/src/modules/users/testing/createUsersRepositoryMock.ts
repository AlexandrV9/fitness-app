import { vi } from "vitest";

import type { IUsersRepository } from "../domain/interfaces/IUsersRepository.js";

export function createUsersRepositoryMock() {
  return {
    createUser: vi.fn<IUsersRepository["createUser"]>(),
    getUserById: vi.fn<IUsersRepository["getUserById"]>(),
    findByLogin: vi.fn<IUsersRepository["findByLogin"]>(),
    findAuthByLogin: vi.fn<IUsersRepository["findAuthByLogin"]>(),
  };
}

export type UsersRepositoryMock = ReturnType<typeof createUsersRepositoryMock>;
