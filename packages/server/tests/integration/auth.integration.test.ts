import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { uniqueLogin, signIn, signUp } from "../setup/fixtures.js";
import { expectErrorMessage, expectStatus, jsonRequest, readJson } from "../setup/http.js";
import {
  releaseTestDatabase,
  resetIntegrationData,
  setupIntegrationSuite,
} from "../setup/integration.js";

import type { TestApp } from "../setup/http.js";
import type { TestDatabase } from "../setup/test-db.js";

describe("auth integration", () => {
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

  it("sign-up создаёт пользователя и сессию", async () => {
    const session = await signUp(app, { login: "Alice", password: "password1" });

    expect(session.user.login).toBe("alice");
    expect(session.accessToken).toBeTruthy();
    expect(session.refreshToken).toBeTruthy();
  });

  it("sign-up отклоняет слабый пароль на валидации OpenAPI", async () => {
    const response = await jsonRequest(app, "POST", "/auth/sign-up", {
      body: { login: uniqueLogin(), password: "short" },
    });

    await expectErrorMessage(response, 400, "INVALID_AUTH_DATA");
  });

  it("sign-up бросает WEAK_PASSWORD для пароля длиннее bcrypt-лимита", async () => {
    const response = await jsonRequest(app, "POST", "/auth/sign-up", {
      body: {
        login: uniqueLogin(),
        password: "x".repeat(73),
      },
    });

    await expectErrorMessage(response, 400, "WEAK_PASSWORD");
  });

  it("sign-up бросает USER_ALREADY_EXISTS при дубликате логина", async () => {
    const login = uniqueLogin("dup");
    await signUp(app, { login, password: "password1" });

    const response = await jsonRequest(app, "POST", "/auth/sign-up", {
      body: { login, password: "password1" },
    });

    await expectErrorMessage(response, 409, "USER_ALREADY_EXISTS");
  });

  it("sign-in выдаёт токены", async () => {
    const login = uniqueLogin("signin");
    await signUp(app, { login, password: "password1" });

    const { response, data } = await signIn(app, login, "password1");
    await expectStatus(response, 200);
    expect(data.user.login).toBe(login.toLowerCase());
    expect(data.accessToken).toBeTruthy();
  });

  it("sign-in бросает INVALID_CREDENTIALS для неизвестного логина", async () => {
    const response = await jsonRequest(app, "POST", "/auth/sign-in", {
      body: { login: uniqueLogin("missing"), password: "password1" },
    });

    await expectErrorMessage(response, 401, "INVALID_CREDENTIALS");
  });

  it("sign-in бросает INVALID_CREDENTIALS для неверного пароля", async () => {
    const login = uniqueLogin("badpass");
    await signUp(app, { login, password: "password1" });

    const response = await jsonRequest(app, "POST", "/auth/sign-in", {
      body: { login, password: "password2" },
    });

    await expectErrorMessage(response, 401, "INVALID_CREDENTIALS");
  });

  it("refresh ротирует токены", async () => {
    const session = await signUp(app);
    const response = await jsonRequest(app, "POST", "/auth/refresh", {
      body: { refreshToken: session.refreshToken },
    });

    await expectStatus(response, 200);
    const body = await readJson<{
      success: true;
      data: { accessToken: string; refreshToken: string };
    }>(response);

    expect(body.data.accessToken).toBeTruthy();
    expect(body.data.refreshToken).toBeTruthy();
    expect(body.data.refreshToken).not.toBe(session.refreshToken);
  });

  it("refresh бросает INVALID_REFRESH_TOKEN для битого токена", async () => {
    const response = await jsonRequest(app, "POST", "/auth/refresh", {
      body: { refreshToken: "not-a-valid-token" },
    });

    await expectErrorMessage(response, 401, "INVALID_REFRESH_TOKEN");
  });

  it("refresh бросает INVALID_REFRESH_TOKEN при повторном использовании старого токена", async () => {
    const session = await signUp(app);

    const first = await jsonRequest(app, "POST", "/auth/refresh", {
      body: { refreshToken: session.refreshToken },
    });
    await expectStatus(first, 200);

    const second = await jsonRequest(app, "POST", "/auth/refresh", {
      body: { refreshToken: session.refreshToken },
    });
    await expectErrorMessage(second, 401, "INVALID_REFRESH_TOKEN");
  });

  it("logout завершается 204 и делает refresh невалидным", async () => {
    const session = await signUp(app);

    const logout = await jsonRequest(app, "POST", "/auth/logout", {
      body: { refreshToken: session.refreshToken },
    });
    await expectStatus(logout, 204);

    const refresh = await jsonRequest(app, "POST", "/auth/refresh", {
      body: { refreshToken: session.refreshToken },
    });
    await expectErrorMessage(refresh, 401, "INVALID_REFRESH_TOKEN");
  });
});
