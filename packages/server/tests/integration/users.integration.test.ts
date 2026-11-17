import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { expiredAccessToken, expectUnauthorized, signUp } from "../setup/fixtures.js";
import { expectErrorMessage, expectStatus, jsonRequest, readJson } from "../setup/http.js";
import {
  releaseTestDatabase,
  resetIntegrationData,
  setupIntegrationSuite,
} from "../setup/integration.js";

import type { TestApp } from "../setup/http.js";
import type { TestDatabase } from "../setup/test-db.js";

describe("users integration", () => {
  let app: TestApp;
  let testDb: TestDatabase;

  beforeAll(async () => {
    ({ app, testDb } = await setupIntegrationSuite());
  }, 180_000);

  afterAll(async () => {
    await releaseTestDatabase();
  });

  beforeEach(async () => {
    await resetIntegrationData(testDb);
  });

  it("GET /users/me возвращает текущего пользователя", async () => {
    const session = await signUp(app, { login: "MeUser", password: "password1" });

    const response = await jsonRequest(app, "GET", "/users/me", {
      token: session.accessToken,
    });

    await expectStatus(response, 200);
    const body = await readJson<{ success: true; data: { id: string; login: string } }>(response);
    expect(body.data).toEqual({
      id: session.user.id,
      login: "meuser",
    });
  });

  it("GET /users/me без токена → Unauthorized", async () => {
    const response = await jsonRequest(app, "GET", "/users/me");
    await expectUnauthorized(response);
  });

  it("GET /users/me с битым токеном → Invalid token", async () => {
    const response = await jsonRequest(app, "GET", "/users/me", {
      token: "invalid.jwt.token",
    });
    await expectErrorMessage(response, 401, "Invalid token");
  });

  it("GET /users/me с истёкшим токеном → Invalid token", async () => {
    const session = await signUp(app);
    const response = await jsonRequest(app, "GET", "/users/me", {
      token: await expiredAccessToken(session.user),
    });
    await expectErrorMessage(response, 401, "Invalid token");
  });

  it("GET /users/me бросает USER_NOT_FOUND, если пользователь удалён", async () => {
    const session = await signUp(app);

    await testDb.pool.query("DELETE FROM users WHERE id = $1", [session.user.id]);

    const response = await jsonRequest(app, "GET", "/users/me", {
      token: session.accessToken,
    });

    await expectErrorMessage(response, 404, "USER_NOT_FOUND");
  });
});
