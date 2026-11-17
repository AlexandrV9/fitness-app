import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { createExercise, createTemplate, expectUnauthorized, signUp } from "../setup/fixtures.js";
import {
  expectErrorMessage,
  expectStatus,
  jsonRequest,
  MISSING_UUID,
  readJson,
} from "../setup/http.js";
import {
  releaseTestDatabase,
  resetIntegrationData,
  setupIntegrationSuite,
} from "../setup/integration.js";

import type { TestApp } from "../setup/http.js";
import type { TestDatabase } from "../setup/test-db.js";

describe("exercises integration", () => {
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

  it("CRUD упражнений для владельца", async () => {
    const session = await signUp(app);
    const created = await createExercise(app, session.accessToken, { name: "Squat" });

    const listed = await jsonRequest(app, "GET", "/exercises", {
      token: session.accessToken,
      query: { page: 0, size: 20, query: "Squat" },
    });
    await expectStatus(listed, 200);
    const listBody = await readJson<{ success: true; data: Array<{ id: string }> }>(listed);
    expect(listBody.data.map((item) => item.id)).toContain(created.id);

    const byId = await jsonRequest(app, "GET", `/exercises/${created.id}`, {
      token: session.accessToken,
    });
    await expectStatus(byId, 200);

    const updated = await jsonRequest(app, "PATCH", `/exercises/${created.id}`, {
      token: session.accessToken,
      body: { name: "Front Squat" },
    });
    await expectStatus(updated, 200);
    const updatedBody = await readJson<{ success: true; data: { name: string } }>(updated);
    expect(updatedBody.data.name).toBe("Front Squat");

    const deleted = await jsonRequest(app, "DELETE", `/exercises/${created.id}`, {
      token: session.accessToken,
    });
    await expectStatus(deleted, 200);
  });

  it("без токена → Unauthorized", async () => {
    await expectUnauthorized(await jsonRequest(app, "GET", "/exercises"));
  });

  it("GET/PATCH/DELETE неизвестного id → EXERCISE_NOT_FOUND", async () => {
    const session = await signUp(app);
    await expectErrorMessage(
      await jsonRequest(app, "GET", `/exercises/${MISSING_UUID}`, {
        token: session.accessToken,
      }),
      404,
      "EXERCISE_NOT_FOUND",
    );

    await expectErrorMessage(
      await jsonRequest(app, "PATCH", `/exercises/${MISSING_UUID}`, {
        token: session.accessToken,
        body: { name: "X" },
      }),
      404,
      "EXERCISE_NOT_FOUND",
    );

    await expectErrorMessage(
      await jsonRequest(app, "DELETE", `/exercises/${MISSING_UUID}`, {
        token: session.accessToken,
      }),
      404,
      "EXERCISE_NOT_FOUND",
    );
  });

  it("чужое упражнение → EXERCISE_NOT_FOUND", async () => {
    const owner = await signUp(app);
    const other = await signUp(app);
    const exercise = await createExercise(app, owner.accessToken);

    await expectErrorMessage(
      await jsonRequest(app, "GET", `/exercises/${exercise.id}`, {
        token: other.accessToken,
      }),
      404,
      "EXERCISE_NOT_FOUND",
    );
  });

  it("невалидная parameterSchema → EXERCISE_INVALID_PARAMETER_SCHEMA", async () => {
    const session = await signUp(app);

    const invalidSchema = [
      { key: "reps", type: "integer" as const },
      { key: "reps", type: "integer" as const },
    ];

    const createResponse = await jsonRequest(app, "POST", "/exercises", {
      token: session.accessToken,
      body: {
        name: "Bad schema",
        parameterSchema: invalidSchema,
      },
    });
    await expectErrorMessage(createResponse, 422, "EXERCISE_INVALID_PARAMETER_SCHEMA");

    const exercise = await createExercise(app, session.accessToken);
    const updateResponse = await jsonRequest(app, "PATCH", `/exercises/${exercise.id}`, {
      token: session.accessToken,
      body: { parameterSchema: invalidSchema },
    });
    await expectErrorMessage(updateResponse, 422, "EXERCISE_INVALID_PARAMETER_SCHEMA");
  });

  it("пустой PATCH → EMPTY_UPDATE", async () => {
    const session = await signUp(app);
    const exercise = await createExercise(app, session.accessToken);

    const response = await jsonRequest(app, "PATCH", `/exercises/${exercise.id}`, {
      token: session.accessToken,
      body: {},
    });

    await expectErrorMessage(response, 400, "EMPTY_UPDATE");
  });

  it("удаление упражнения из шаблона → EXERCISE_USED_IN_WORKOUT_TEMPLATE", async () => {
    const session = await signUp(app);
    const exercise = await createExercise(app, session.accessToken);
    await createTemplate(app, session.accessToken, exercise.id);

    const response = await jsonRequest(app, "DELETE", `/exercises/${exercise.id}`, {
      token: session.accessToken,
    });

    await expectErrorMessage(response, 409, "EXERCISE_USED_IN_WORKOUT_TEMPLATE");
  });
});
