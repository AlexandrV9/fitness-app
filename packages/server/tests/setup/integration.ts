import { resetTables, startTestDatabase, type TestDatabase } from "./test-db.js";

import type { TestApp } from "./http.js";

let bootstrapping: Promise<{ app: TestApp; testDb: TestDatabase }> | null = null;

export const setupIntegrationSuite = async () => {
  if (!bootstrapping) {
    bootstrapping = (async () => {
      const testDb = await startTestDatabase();
      const { app } = await import("~/app.js");
      return { app, testDb };
    })();
  }

  return bootstrapping;
};

export const resetIntegrationData = async (testDb: TestDatabase) => {
  await resetTables(testDb.pool);
};

export { releaseTestDatabase } from "./test-db.js";
