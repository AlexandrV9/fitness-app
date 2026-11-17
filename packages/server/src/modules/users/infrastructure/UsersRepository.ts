import type { IUser, IUserAuth } from "../domain/interfaces/IUser.js";
import type { CreateUserProps, IUsersRepository } from "../domain/interfaces/IUsersRepository.js";
import type { Pool } from "pg";

export class UsersRepository implements IUsersRepository {
  constructor(private readonly pool: Pool) {}

  async createTable(): Promise<void> {
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        login TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL
      );
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM pg_attribute
          WHERE attrelid = 'users'::regclass AND attname = 'email' AND NOT attisdropped
        ) AND NOT EXISTS (
          SELECT 1 FROM pg_attribute
          WHERE attrelid = 'users'::regclass AND attname = 'login' AND NOT attisdropped
        ) THEN
          ALTER TABLE users RENAME COLUMN email TO login;
          IF to_regclass('users_login_lower_idx') IS NULL THEN
            ALTER INDEX IF EXISTS users_email_lower_idx RENAME TO users_login_lower_idx;
          END IF;
        END IF;
      END $$;
      CREATE UNIQUE INDEX IF NOT EXISTS users_login_lower_idx ON users (lower(login))
    `);
  }

  async createUser({ login, passwordHash }: CreateUserProps): Promise<IUser | null> {
    const {
      rows: [user],
    } = await this.pool.query<IUser>(
      `
        INSERT INTO users (login, password_hash)
        VALUES ($1, $2)
        ON CONFLICT DO NOTHING
        RETURNING id, login
      `,
      [login, passwordHash],
    );

    return user ?? null;
  }

  async getUserById(userId: string): Promise<IUser | null> {
    const {
      rows: [user],
    } = await this.pool.query<IUser>(
      `
        SELECT id, login
        FROM users
        WHERE id = $1
      `,
      [userId],
    );

    return user ?? null;
  }

  async findByLogin(login: string): Promise<IUser | null> {
    const {
      rows: [user],
    } = await this.pool.query<IUser>(
      `
        SELECT id, login
        FROM users
        WHERE lower(login) = lower($1)
      `,
      [login],
    );

    return user ?? null;
  }

  async findAuthByLogin(login: string): Promise<IUserAuth | null> {
    const {
      rows: [user],
    } = await this.pool.query<{ id: string; login: string; password_hash: string }>(
      `
        SELECT id, login, password_hash
        FROM users
        WHERE lower(login) = lower($1)
      `,
      [login],
    );

    if (!user) return null;

    return {
      id: user.id,
      login: user.login,
      passwordHash: user.password_hash,
    };
  }
}
