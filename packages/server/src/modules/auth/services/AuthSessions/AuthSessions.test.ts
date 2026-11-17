import { createHash } from "node:crypto";

import { describe, expect, it, vi } from "vitest";

import { InvalidRefreshTokenException } from "../../domain/exceptions/InvalidRefreshTokenException.js";
import { createJwtAuthTokenManagerMock } from "../../testing/createJwtAuthTokenManagerMock.js";
import { AuthSessionsService } from "./index.js";

import type { IRefreshSessionsRepository } from "../../domain/interfaces/IRefreshSessionsRepository.js";

describe("AuthSessionsService", () => {
  it("возвращает новую пару только при успешной ротации сохранённого хеша", async () => {
    const user = { id: "205c2075-2a42-4f88-b5b2-fcd09933b699", login: "alice" };
    const tokens = createJwtAuthTokenManagerMock();
    tokens.verifyRefreshToken.mockResolvedValue({ success: true, payload: { data: user } });
    tokens.generateTokens.mockResolvedValue({ accessToken: "access", refreshToken: "next" });

    const repository = {
      createRefreshSession: vi.fn<IRefreshSessionsRepository["createRefreshSession"]>(),
      updateRefreshTokenHash: vi
        .fn<IRefreshSessionsRepository["updateRefreshTokenHash"]>()
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(false),
      revokeRefreshSession: vi.fn<IRefreshSessionsRepository["revokeRefreshSession"]>(),
    };
    const sessions = new AuthSessionsService(tokens, repository, 60);

    await expect(sessions.refresh("current")).resolves.toEqual({
      accessToken: "access",
      refreshToken: "next",
      user,
    });
    expect(repository.updateRefreshTokenHash).toHaveBeenCalledExactlyOnceWith(
      user.id,
      createHash("sha256").update("current").digest("hex"),
      createHash("sha256").update("next").digest("hex"),
      expect.any(Date),
    );
    await expect(sessions.refresh("current")).rejects.toThrow(InvalidRefreshTokenException);
  });
});
