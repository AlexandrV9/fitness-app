import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { releaseTestDatabase, startTestDatabase, type TestDatabase } from "../setup/test-db.js";

describe("test database bootstrap", () => {
  let testDb: TestDatabase;

  beforeAll(async () => {
    testDb = await startTestDatabase();
  }, 180_000);

  afterAll(async () => {
    await releaseTestDatabase();
  });

  it("connects to a non-dev database and has core tables", async () => {
    const { rows } = await testDb.pool.query<{ current_database: string }>(
      "SELECT current_database()",
    );

    expect(rows[0]?.current_database).not.toBe("fitness-app");

    const tables = await testDb.pool.query<{ tablename: string }>(
      `SELECT tablename FROM pg_tables
       WHERE schemaname = 'public'
         AND tablename IN ('users', 'refresh_sessions', 'exercises')
       ORDER BY tablename`,
    );

    expect(tables.rows.map((row) => row.tablename)).toEqual([
      "exercises",
      "refresh_sessions",
      "users",
    ]);
  });
});
