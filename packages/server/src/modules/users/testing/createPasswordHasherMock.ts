import { vi } from "vitest";

import type { IPasswordHasher } from "../domain/interfaces/IPasswordHasher.js";

export function createPasswordHasherMock() {
  return {
    hash: vi.fn<IPasswordHasher["hash"]>(),
    verify: vi.fn<IPasswordHasher["verify"]>(),
  };
}

export type PasswordHasherMock = ReturnType<typeof createPasswordHasherMock>;
