export interface IRefreshSessionsRepository {
  createRefreshSession(
    sessionId: string,
    userId: string,
    tokenHash: string,
    expiresAt: Date,
  ): Promise<void>;
  updateRefreshTokenHash(
    userId: string,
    tokenHash: string,
    nextTokenHash: string,
    expiresAt: Date,
  ): Promise<boolean>;
  revokeRefreshSession(userId: string, sessionId: string): Promise<void>;
}
