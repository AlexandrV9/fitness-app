import type { IRefreshSessionsRepository } from "../domain/interfaces/IRefreshSessionsRepository.js";
import type { Pool } from "pg";

export class RefreshSessionsRepository implements IRefreshSessionsRepository {
  constructor(private readonly pool: Pool) {}

  async createTable(): Promise<void> {
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS refresh_sessions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        refresh_token_hash TEXT NOT NULL UNIQUE,
        expires_at TIMESTAMPTZ NOT NULL,
        revoked_at TIMESTAMPTZ
      );
      CREATE INDEX IF NOT EXISTS refresh_sessions_user_id_idx ON refresh_sessions (user_id)
    `);
  }

  async createRefreshSession(userId: string, tokenHash: string, expiresAt: Date): Promise<void> {
    await this.pool.query(
      `
        INSERT INTO refresh_sessions (user_id, refresh_token_hash, expires_at) 
        VALUES ($1, $2, $3)
      `,
      [userId, tokenHash, expiresAt],
    );
  }

  /**
   * Обновляет хэш рефреш токена
   * @param userId - идентификатор сессии пользователя (его id)
   * @param tokenHash - текущий хэш рефреш токена
   * @param nextTokenHash - новый хэщ рефреш токена
   * @param expiresAt - время жизни для нового рефреш токена
   * @returns true если получилось обновить хэш рефреш токена и false, если нет
   */
  async updateRefreshTokenHash(
    userId: string,
    tokenHash: string,
    nextTokenHash: string,
    expiresAt: Date,
  ) {
    const { rowCount } = await this.pool.query(
      `
        UPDATE refresh_sessions
        SET refresh_token_hash = $3, expires_at = $4
        WHERE user_id = $1 AND refresh_token_hash = $2
          AND revoked_at IS NULL AND expires_at > clock_timestamp()
      `,
      [userId, tokenHash, nextTokenHash, expiresAt],
    );

    return rowCount === 1;
  }

  /**
   * Отзывает сессию пользователя
   * @param tokenHash
   */
  async revokeRefreshSession(tokenHash: string): Promise<void> {
    await this.pool.query(
      `
        UPDATE refresh_sessions SET revoked_at = clock_timestamp()
        WHERE refresh_token_hash = $1 AND revoked_at IS NULL
      `,
      [tokenHash],
    );
  }
}
