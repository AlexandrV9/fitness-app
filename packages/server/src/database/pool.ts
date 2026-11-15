import pg, { type PoolConfig } from "pg";

import { config } from "../config/index.js";

export const getPoolConfig = (): PoolConfig => ({
  host: config.db.host,
  port: config.db.port,
  database: config.db.database,
  user: config.db.user,
  password: config.db.password,
  connectionTimeoutMillis: 5_000,
});

export const pool = new pg.Pool(getPoolConfig());

pool.on("error", (error) => {
  console.error("PostgreSQL pool error:", error.message);
});

export const checkDatabaseConnection = async () => {
  try {
    const { rows } = await pool.query<{ name: string }>("SELECT current_database() AS name");
    console.log(`Connected to PostgreSQL database "${rows[0]?.name}"`);
  } catch (error) {
    console.error("Could not connect to PostgreSQL:", error);
    await pool.end();
    process.exit(1);
  }
};
