import { PostgreSqlContainer } from "@testcontainers/postgresql";
import pg, { type Pool, type PoolConfig } from "pg";

import { RefreshSessionsRepository } from "~/modules/auth/infrastructure/RefreshSessionsRepository.js";
import { ExercisesRepository } from "~/modules/exercises/infrastructure/ExercisesRepository.js";
import { UsersRepository } from "~/modules/users/infrastructure/UsersRepository.js";
import { WorkoutExercisesRepository } from "~/modules/workouts/infrastructure/WorkoutExercisesRepository.js";
import { WorkoutSetsRepository } from "~/modules/workouts/infrastructure/WorkoutSetsRepository.js";
import { WorkoutsRepository } from "~/modules/workouts/infrastructure/WorkoutsRepository.js";
import { WorkoutTemplateExercisesRepository } from "~/modules/workouts/infrastructure/WorkoutTemplateExercisesRepository.js";
import { WorkoutTemplatesRepository } from "~/modules/workouts/infrastructure/WorkoutTemplatesRepository.js";

import type { StartedPostgreSqlContainer } from "@testcontainers/postgresql";

export type TestDatabase = {
  container: StartedPostgreSqlContainer | null;
  pool: Pool;
  stop: () => Promise<void>;
};

const CONNECTION_TIMEOUT_MS = 5_000;
const TESTCONTAINERS_TIMEOUT_MS = 180_000;
export const DEFAULT_TEST_DB_NAME = "fitness_app_test";

type SavedDbEnv = {
  DB_HOST?: string;
  DB_PORT?: string;
  DB_NAME?: string;
  DB_USER?: string;
  DB_PASSWORD?: string;
};

let savedDbEnv: SavedDbEnv | null = null;

export const normalizeEnvValue = (value?: string) =>
  value?.trim().replace(/^(['"])(.*)\1$/, "$2") ?? "";

export const isEnvTruthy = (value?: string) => {
  const normalized = normalizeEnvValue(value).toLowerCase();
  return normalized === "true" || normalized === "1" || normalized === "yes";
};

const getProtectedDatabaseNames = (): string[] => {
  const fromEnv = normalizeEnvValue(process.env.DEV_DB_PROTECT) || "fitness-app";

  return [
    ...new Set(
      fromEnv
        .split(",")
        .map((name) => name.trim())
        .filter(Boolean),
    ),
  ];
};

export const assertSafeTestDatabase = async (pool: Pool) => {
  const { rows } = await pool.query<{ current_database: string }>("SELECT current_database()");
  const currentDatabase = rows[0]?.current_database;
  const protectedNames = getProtectedDatabaseNames();

  if (currentDatabase && protectedNames.includes(currentDatabase)) {
    throw new Error(
      [
        `Refusing to modify protected database "${currentDatabase}".`,
        "Use USE_TESTCONTAINERS=true (default in .env.test) or TEST_DB_NAME on a separate database.",
        `Protected: ${protectedNames.join(", ")}`,
      ].join("\n"),
    );
  }
};

const saveDbEnv = () => {
  if (savedDbEnv) return;

  savedDbEnv = {
    DB_HOST: process.env.DB_HOST,
    DB_PORT: process.env.DB_PORT,
    DB_NAME: process.env.DB_NAME,
    DB_USER: process.env.DB_USER,
    DB_PASSWORD: process.env.DB_PASSWORD,
  };
};

const restoreDbEnv = () => {
  if (!savedDbEnv) return;

  for (const key of Object.keys(savedDbEnv) as (keyof SavedDbEnv)[]) {
    const value = savedDbEnv[key];
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }

  savedDbEnv = null;
};

export const configureDatabaseEnv = (container: StartedPostgreSqlContainer) => {
  process.env.DB_HOST = container.getHost();
  process.env.DB_PORT = String(container.getFirstMappedPort());
  process.env.DB_NAME = container.getDatabase();
  process.env.DB_USER = container.getUsername();
  process.env.DB_PASSWORD = container.getPassword();
};

const configureDatabaseEnvFromUrl = (connectionUrl: string) => {
  const url = new URL(connectionUrl);

  process.env.DB_HOST = url.hostname;
  process.env.DB_PORT = url.port || "5432";
  process.env.DB_NAME = url.pathname.replace(/^\//, "");
  process.env.DB_USER = decodeURIComponent(url.username);
  process.env.DB_PASSWORD = decodeURIComponent(url.password);
};

const getBasePoolConfig = (): PoolConfig => ({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT ?? 5432),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

const probeConnection = async (config: PoolConfig): Promise<boolean> => {
  const client = new pg.Client(config);

  try {
    await Promise.race([
      client.connect(),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("connection timeout")), CONNECTION_TIMEOUT_MS),
      ),
    ]);

    await client.end();
    return true;
  } catch {
    try {
      await client.end();
    } catch {
      // ignore
    }

    return false;
  }
};

const ensureTestDatabase = async (testDbName: string) => {
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(testDbName)) {
    throw new Error(`Invalid TEST_DB_NAME: ${testDbName}`);
  }

  const adminPool = new pg.Pool({
    ...getBasePoolConfig(),
    database: "postgres",
  });

  try {
    const { rows } = await adminPool.query("SELECT 1 FROM pg_database WHERE datname = $1", [
      testDbName,
    ]);

    if (rows.length === 0) {
      await adminPool.query(`CREATE DATABASE ${testDbName}`);
    }
  } finally {
    await adminPool.end();
  }
};

export const setupSchema = async (pool: Pool) => {
  await new UsersRepository(pool).createTable();
  await new RefreshSessionsRepository(pool).createTable();
  await new ExercisesRepository(pool).createTable();
  await new WorkoutTemplatesRepository(pool).createTable();
  await new WorkoutTemplateExercisesRepository(pool).createTable();
  await new WorkoutsRepository(pool).createTable();
  await new WorkoutExercisesRepository(pool).createTable();
  await new WorkoutSetsRepository(pool).createTable();
};

export const resetTables = async (pool: Pool) => {
  await assertSafeTestDatabase(pool);

  await pool.query(`
    TRUNCATE TABLE
      workout_sets,
      workout_exercises,
      workouts,
      workout_template_exercises,
      workout_templates,
      exercises,
      refresh_sessions,
      users
    RESTART IDENTITY CASCADE
  `);
};

const createTestDatabase = async (
  container: StartedPostgreSqlContainer | null,
): Promise<TestDatabase> => {
  saveDbEnv();

  const testConnectionEnv: SavedDbEnv = {
    DB_HOST: process.env.DB_HOST,
    DB_PORT: process.env.DB_PORT,
    DB_NAME: process.env.DB_NAME,
    DB_USER: process.env.DB_USER,
    DB_PASSWORD: process.env.DB_PASSWORD,
  };

  const { closePool, pool } = await import("~/database/pool.js");

  for (const [key, value] of Object.entries(testConnectionEnv)) {
    if (value !== undefined) {
      process.env[key] = value;
    }
  }

  await closePool();
  await setupSchema(pool);
  await assertSafeTestDatabase(pool);

  const { rows } = await pool.query<{ current_database: string }>("SELECT current_database()");
  console.info(
    `[tests] Using database "${rows[0]?.current_database ?? "unknown"}"${container ? " (Testcontainers)" : ""}`,
  );

  return {
    container,
    pool,
    stop: async () => {
      pool.on("error", () => undefined);

      const { closePool: close } = await import("~/database/pool.js");
      await close();

      if (container) {
        await container.stop();
      }
    },
  };
};

const startWithTestcontainers = async (): Promise<TestDatabase> => {
  const container = await new PostgreSqlContainer("postgres:16-alpine")
    .withDatabase(DEFAULT_TEST_DB_NAME)
    .withUsername("test")
    .withPassword("test")
    .withStartupTimeout(TESTCONTAINERS_TIMEOUT_MS)
    .start();

  configureDatabaseEnv(container);

  return createTestDatabase(container);
};

const startFromEnv = async (): Promise<TestDatabase | null> => {
  const { DB_HOST, DB_USER, DB_PASSWORD } = process.env;

  if (!DB_HOST || !DB_USER || DB_PASSWORD === undefined) {
    return null;
  }

  const testDbName = normalizeEnvValue(process.env.TEST_DB_NAME) || DEFAULT_TEST_DB_NAME;

  if (getProtectedDatabaseNames().includes(testDbName)) {
    throw new Error(
      `TEST_DB_NAME "${testDbName}" is protected (DEV_DB_PROTECT). Use Testcontainers or another database name.`,
    );
  }

  const canReachPostgres = await probeConnection({
    ...getBasePoolConfig(),
    database: "postgres",
  });

  if (!canReachPostgres) {
    return null;
  }

  await ensureTestDatabase(testDbName);

  process.env.DB_NAME = testDbName;

  const canReachTestDb = await probeConnection({
    ...getBasePoolConfig(),
    database: testDbName,
  });

  if (!canReachTestDb) {
    return null;
  }

  return createTestDatabase(null);
};

let sharedTestDb: TestDatabase | null = null;
let sharedTestDbInit: Promise<TestDatabase> | null = null;
let sharedTestDbRefs = 0;

const bootstrapTestDatabase = async (): Promise<TestDatabase> => {
  if (process.env.TEST_DATABASE_URL) {
    configureDatabaseEnvFromUrl(process.env.TEST_DATABASE_URL);
    return createTestDatabase(null);
  }

  if (isEnvTruthy(process.env.USE_TESTCONTAINERS)) {
    return startWithTestcontainers();
  }

  const fromEnv = await startFromEnv();

  if (fromEnv) {
    return fromEnv;
  }

  throw new Error(
    [
      "Postgres для интеграционных тестов недоступен.",
      "По умолчанию нужен Docker: USE_TESTCONTAINERS=true (см. .env.test).",
      "Fallback: docker compose -f .docker/docker-compose.yaml up -d postgres + TEST_DB_NAME=fitness_app_test",
      "Или задай TEST_DATABASE_URL.",
    ].join("\n"),
  );
};

/** Shared Postgres for all integration test files (one container / one pool). */
export const startTestDatabase = async (): Promise<TestDatabase> => {
  if (!sharedTestDbInit) {
    sharedTestDbInit = bootstrapTestDatabase().then((db) => {
      sharedTestDb = db;
      return db;
    });
  }

  const db = await sharedTestDbInit;
  sharedTestDbRefs++;
  return db;
};

export const releaseTestDatabase = async (): Promise<void> => {
  sharedTestDbRefs = Math.max(0, sharedTestDbRefs - 1);

  if (sharedTestDbRefs > 0) return;

  if (sharedTestDb) {
    await sharedTestDb.stop();

    sharedTestDb = null;
    sharedTestDbInit = null;
  }

  restoreDbEnv();
};
