import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { createExercise, createTemplate, expectUnauthorized, signUp } from "../setup/fixtures.js";
import {
  expectErrorCode,
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

describe("workout templates integration", () => {
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

  it("CRUD шаблонов", async () => {
    const session = await signUp(app);
    const exercise = await createExercise(app, session.accessToken);
    const created = await createTemplate(app, session.accessToken, exercise.id, {
      name: "Leg day",
      plannedSets: 3,
    });

    const listed = await jsonRequest(app, "GET", "/workout-templates", {
      token: session.accessToken,
    });
    await expectStatus(listed, 200);
    const listBody = await readJson<{ success: true; data: Array<{ id: string }> }>(listed);
    expect(listBody.data.map((item) => item.id)).toContain(created.id);

    const byId = await jsonRequest(app, "GET", `/workout-templates/${created.id}`, {
      token: session.accessToken,
    });
    await expectStatus(byId, 200);

    const updated = await jsonRequest(app, "PATCH", `/workout-templates/${created.id}`, {
      token: session.accessToken,
      body: { name: "Heavy legs" },
    });
    await expectStatus(updated, 200);
    const updatedBody = await readJson<{ success: true; data: { name: string } }>(updated);
    expect(updatedBody.data.name).toBe("Heavy legs");

    const deleted = await jsonRequest(app, "DELETE", `/workout-templates/${created.id}`, {
      token: session.accessToken,
    });
    await expectStatus(deleted, 200);
  });

  it("без токена → Unauthorized", async () => {
    await expectUnauthorized(await jsonRequest(app, "GET", "/workout-templates"));
  });

  it("неизвестный шаблон → WORKOUT_TEMPLATE_NOT_FOUND", async () => {
    const session = await signUp(app);
    await expectErrorCode(
      await jsonRequest(app, "GET", `/workout-templates/${MISSING_UUID}`, {
        token: session.accessToken,
      }),
      404,
      "WORKOUT_TEMPLATE_NOT_FOUND",
    );

    await expectErrorCode(
      await jsonRequest(app, "PATCH", `/workout-templates/${MISSING_UUID}`, {
        token: session.accessToken,
        body: { name: "X" },
      }),
      404,
      "WORKOUT_TEMPLATE_NOT_FOUND",
    );

    await expectErrorCode(
      await jsonRequest(app, "DELETE", `/workout-templates/${MISSING_UUID}`, {
        token: session.accessToken,
      }),
      404,
      "WORKOUT_TEMPLATE_NOT_FOUND",
    );
  });

  it("чужой шаблон → WORKOUT_TEMPLATE_NOT_FOUND на GET/PATCH/DELETE", async () => {
    const owner = await signUp(app);
    const other = await signUp(app);
    const exercise = await createExercise(app, owner.accessToken);
    const template = await createTemplate(app, owner.accessToken, exercise.id);

    await expectErrorCode(
      await jsonRequest(app, "GET", `/workout-templates/${template.id}`, {
        token: other.accessToken,
      }),
      404,
      "WORKOUT_TEMPLATE_NOT_FOUND",
    );

    await expectErrorCode(
      await jsonRequest(app, "PATCH", `/workout-templates/${template.id}`, {
        token: other.accessToken,
        body: { name: "Hijacked" },
      }),
      404,
      "WORKOUT_TEMPLATE_NOT_FOUND",
    );

    await expectErrorCode(
      await jsonRequest(app, "DELETE", `/workout-templates/${template.id}`, {
        token: other.accessToken,
      }),
      404,
      "WORKOUT_TEMPLATE_NOT_FOUND",
    );
  });

  it("create/update с несуществующим exerciseId → WORKOUT_TEMPLATE_EXERCISE_NOT_FOUND", async () => {
    const session = await signUp(app);
    const exercise = await createExercise(app, session.accessToken);
    const template = await createTemplate(app, session.accessToken, exercise.id);

    await expectErrorCode(
      await jsonRequest(app, "POST", "/workout-templates", {
        token: session.accessToken,
        body: {
          name: "Broken",
          exercises: [{ exerciseId: MISSING_UUID, plannedSets: 1 }],
        },
      }),
      404,
      "WORKOUT_TEMPLATE_EXERCISE_NOT_FOUND",
    );

    await expectErrorCode(
      await jsonRequest(app, "PATCH", `/workout-templates/${template.id}`, {
        token: session.accessToken,
        body: {
          exercises: [{ exerciseId: MISSING_UUID, plannedSets: 2 }],
        },
      }),
      404,
      "WORKOUT_TEMPLATE_EXERCISE_NOT_FOUND",
    );
  });

  it("пустой PATCH → EMPTY_UPDATE", async () => {
    const session = await signUp(app);
    const exercise = await createExercise(app, session.accessToken);
    const template = await createTemplate(app, session.accessToken, exercise.id);

    const response = await jsonRequest(app, "PATCH", `/workout-templates/${template.id}`, {
      token: session.accessToken,
      body: {},
    });

    await expectErrorMessage(response, 400, "EMPTY_UPDATE");
  });

  it("невалидные данные шаблона → INVALID_TEMPLATE_DATA", async () => {
    const session = await signUp(app);
    const response = await jsonRequest(app, "POST", "/workout-templates", {
      token: session.accessToken,
      body: { name: "", exercises: [] },
    });

    await expectErrorMessage(response, 400, "INVALID_TEMPLATE_DATA");
  });
});
