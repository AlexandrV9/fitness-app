export interface IRefreshSessionsRepository {
  createRefreshSession(userId: string, tokenHash: string, expiresAt: Date): Promise<void>;
  updateRefreshTokenHash(
    userId: string,
    tokenHash: string,
    nextTokenHash: string,
    expiresAt: Date,
  ): Promise<boolean>;
  revokeRefreshSession(tokenHash: string): Promise<void>;
}
