import { vi } from "vitest";

import type { IJwtAuthTokenManager } from "../domain/interfaces/IJwtAuthTokenManager.js";

export function createJwtAuthTokenManagerMock() {
  return {
    generateAccessToken: vi.fn<IJwtAuthTokenManager["generateAccessToken"]>(),
    generateRefreshToken: vi.fn<IJwtAuthTokenManager["generateRefreshToken"]>(),
    generateTokens: vi.fn<IJwtAuthTokenManager["generateTokens"]>(),
    verifyAccessToken: vi.fn<IJwtAuthTokenManager["verifyAccessToken"]>(),
    verifyRefreshToken: vi.fn<IJwtAuthTokenManager["verifyRefreshToken"]>(),
    extractTokenFromAuthHeader: vi.fn<IJwtAuthTokenManager["extractTokenFromAuthHeader"]>(),
  };
}

export type JwtAuthTokenManagerMock = ReturnType<typeof createJwtAuthTokenManagerMock>;
