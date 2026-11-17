import { createHash } from "node:crypto";
import { describe, expect, it, vi } from "vitest";

import { InvalidRefreshTokenException } from "../../domain/exceptions/index.js";
import { createJwtAuthTokenManagerMock } from "../../testing/createJwtAuthTokenManagerMock.js";
import { AuthSessionsService } from "./index.js";

import type { IRefreshSessionsRepository } from "../../domain/interfaces/IRefreshSessionsRepository.js";

const user = { id: "205c2075-2a42-4f88-b5b2-fcd09933b699", login: "alice" };
const sessionId = "f57a3f9f-dd72-46fa-8241-45fb50cd3297";

function createSessionService() {
  const tokens = createJwtAuthTokenManagerMock();
  tokens.verifyRefreshToken.mockResolvedValue({
    success: true,
    payload: { data: user, sid: sessionId },
  });
  tokens.generateTokens.mockResolvedValue({ accessToken: "access", refreshToken: "next" });

  const repository = {
    createRefreshSession: vi.fn<IRefreshSessionsRepository["createRefreshSession"]>(),
    updateRefreshTokenHash: vi.fn<IRefreshSessionsRepository["updateRefreshTokenHash"]>(),
    revokeRefreshSession: vi.fn<IRefreshSessionsRepository["revokeRefreshSession"]>(),
  };
  const sessions = new AuthSessionsService(tokens, repository, 60);

  return { sessions, tokens, repository };
}

describe("AuthSessionsService", () => {
  it("возвращает новую пару только при успешной ротации сохранённого хеша", async () => {
    const { sessions, tokens, repository } = createSessionService();
    repository.updateRefreshTokenHash.mockResolvedValueOnce(true).mockResolvedValueOnce(false);

    await expect(sessions.refresh("current")).resolves.toEqual({
      accessToken: "access",
      refreshToken: "next",
      user,
    });
    expect(tokens.generateTokens).toHaveBeenCalledExactlyOnceWith(user, sessionId);
    expect(repository.updateRefreshTokenHash).toHaveBeenCalledExactlyOnceWith(
      user.id,
      createHash("sha256").update("current").digest("hex"),
      createHash("sha256").update("next").digest("hex"),
      expect.any(Date),
    );
    await expect(sessions.refresh("current")).rejects.toThrow(InvalidRefreshTokenException);
  });

  it("отзывает сессию по её идентификатору из ранее выданного токена", async () => {
    const { sessions, repository } = createSessionService();
    repository.updateRefreshTokenHash.mockResolvedValue(true);

    await sessions.refresh("current");
    await sessions.logout("current");

    expect(repository.revokeRefreshSession).toHaveBeenCalledExactlyOnceWith(user.id, sessionId);
  });

  it("отклоняет refresh без sid", async () => {
    const { sessions, tokens, repository } = createSessionService();
    tokens.verifyRefreshToken.mockResolvedValue({ success: true, payload: { data: user } });

    await expect(sessions.refresh("current")).rejects.toThrow(InvalidRefreshTokenException);
    expect(repository.updateRefreshTokenHash).not.toHaveBeenCalled();
  });

  it("оставляет сессию активной при выходе по токену с неверной подписью", async () => {
    const { sessions, tokens, repository } = createSessionService();
    tokens.verifyRefreshToken.mockResolvedValue({ success: false, payload: null });

    await sessions.logout("invalid");

    expect(repository.revokeRefreshSession).not.toHaveBeenCalled();
  });
});
