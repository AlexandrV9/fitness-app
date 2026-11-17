import { vi } from "vitest";

import type { IAuthSessionsService } from "../domain/interfaces/IAuthSessionsService.js";

export function createAuthSessionsServiceMock() {
  return {
    createUserSession: vi.fn<IAuthSessionsService["createUserSession"]>(),
    refresh: vi.fn<IAuthSessionsService["refresh"]>(),
    logout: vi.fn<IAuthSessionsService["logout"]>(),
  };
}

export type AuthSessionsServiceMock = ReturnType<typeof createAuthSessionsServiceMock>;
