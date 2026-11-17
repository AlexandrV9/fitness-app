import pg, { type Pool, type PoolConfig } from "pg";

import { config } from "../config/index.js";

export const getPoolConfig = (): PoolConfig => ({
  host: process.env.DB_HOST ?? config.db.host,
  port: Number(process.env.DB_PORT ?? config.db.port),
  database: process.env.DB_NAME ?? config.db.database,
  user: process.env.DB_USER ?? config.db.user,
  password: process.env.DB_PASSWORD ?? config.db.password,
  connectionTimeoutMillis: 5_000,
});

let poolInstance: Pool | null = null;

const getPool = (): Pool => {
  if (poolInstance) return poolInstance;

  poolInstance = new pg.Pool(getPoolConfig());

  poolInstance.on("error", (error) => {
    console.error("PostgreSQL pool error:", error.message);
  });

  return poolInstance;
};

export const closePool = async () => {
  if (!poolInstance) return;

  const instance = poolInstance;
  poolInstance = null;

  try {
    await instance.end();
  } catch {
    // Pool may already be closed (e.g. shared test teardown).
  }
};

export const pool: Pool = new Proxy({} as Pool, {
  get(_target, prop) {
    const instance = getPool();
    const value = Reflect.get(instance, prop, instance);

    return typeof value === "function"
      ? (value as (...args: unknown[]) => unknown).bind(instance)
      : value;
  },
});

export const checkDatabaseConnection = async () => {
  try {
    const { rows } = await pool.query<{ name: string }>("SELECT current_database() AS name");
    console.log(`Connected to PostgreSQL database "${rows[0]?.name}"`);
  } catch (error) {
    console.error("Could not connect to PostgreSQL:", error);
    await closePool();
    process.exit(1);
  }
};
