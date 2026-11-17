import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import {
  createExercise,
  createTemplate,
  expectUnauthorized,
  signUp,
  startWorkout,
} from "../setup/fixtures.js";
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

describe("workouts integration", () => {
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

  const seedActiveWorkout = async () => {
    const session = await signUp(app);
    const exercise = await createExercise(app, session.accessToken, {
      name: "Squat",
      parameterSchema: [{ key: "reps", type: "integer", min: 1 }],
    });
    const template = await createTemplate(app, session.accessToken, exercise.id, {
      plannedSets: 2,
    });
    const { workout } = await startWorkout(app, session.accessToken, template.id);
    return { session, exercise, template, workout };
  };

  it("без токена → Unauthorized", async () => {
    await expectUnauthorized(await jsonRequest(app, "GET", "/workouts"));
  });

  it("GET /workouts/active без активной → null", async () => {
    const session = await signUp(app);
    const response = await jsonRequest(app, "GET", "/workouts/active", {
      token: session.accessToken,
    });

    await expectStatus(response, 200);
    const body = await readJson<{ success: true; data: null }>(response);
    expect(body.data).toBeNull();
  });

  it("старт / active / get / finish / список завершённых", async () => {
    const { session, template, workout } = await seedActiveWorkout();

    const active = await jsonRequest(app, "GET", "/workouts/active", {
      token: session.accessToken,
    });
    await expectStatus(active, 200);
    const activeBody = await readJson<{ success: true; data: { id: string } | null }>(active);
    expect(activeBody.data?.id).toBe(workout.id);

    const byId = await jsonRequest(app, "GET", `/workouts/${workout.id}`, {
      token: session.accessToken,
    });
    await expectStatus(byId, 200);

    const sameTemplate = await startWorkout(app, session.accessToken, template.id);
    expect(sameTemplate.response.status).toBe(200);
    expect(sameTemplate.workout.id).toBe(workout.id);

    const finished = await jsonRequest(app, "POST", `/workouts/${workout.id}/finish`, {
      token: session.accessToken,
    });
    await expectStatus(finished, 200);
    const finishedBody = await readJson<{
      success: true;
      data: { finishedAt: string | null };
    }>(finished);
    expect(finishedBody.data.finishedAt).toBeTruthy();

    // GET /workouts возвращает только завершённые тренировки
    const listed = await jsonRequest(app, "GET", "/workouts", {
      token: session.accessToken,
    });
    await expectStatus(listed, 200);
    const listBody = await readJson<{
      success: true;
      data: { data: Array<{ id: string }> };
    }>(listed);
    expect(listBody.data.data.map((item) => item.id)).toContain(workout.id);
  });

  it("старт с другим шаблоном при активной → ACTIVE_WORKOUT_EXISTS", async () => {
    const { session, workout } = await seedActiveWorkout();
    const anotherExercise = await createExercise(app, session.accessToken, {
      name: "Deadlift",
    });
    const anotherTemplate = await createTemplate(app, session.accessToken, anotherExercise.id, {
      name: "Pull day",
    });

    const response = await jsonRequest(app, "POST", "/workouts", {
      token: session.accessToken,
      body: { templateId: anotherTemplate.id },
    });

    await expectErrorCode(response, 409, "ACTIVE_WORKOUT_EXISTS");
    expect(workout.id).toBeTruthy();
  });

  it("старт с неизвестным шаблоном → WORKOUT_TEMPLATE_NOT_FOUND", async () => {
    const session = await signUp(app);
    const response = await jsonRequest(app, "POST", "/workouts", {
      token: session.accessToken,
      body: { templateId: MISSING_UUID },
    });

    await expectErrorCode(response, 404, "WORKOUT_TEMPLATE_NOT_FOUND");
  });

  it("старт при удалённом пользователе → USER_NOT_FOUND", async () => {
    const session = await signUp(app);
    await testDb.pool.query("DELETE FROM users WHERE id = $1", [session.user.id]);

    const response = await jsonRequest(app, "POST", "/workouts", {
      token: session.accessToken,
      body: { templateId: MISSING_UUID },
    });

    await expectErrorCode(response, 404, "USER_NOT_FOUND");
  });

  it("невалидные OpenAPI данные → INVALID_WORKOUT_DATA", async () => {
    const session = await signUp(app);

    await expectErrorMessage(
      await jsonRequest(app, "POST", "/workouts", {
        token: session.accessToken,
        body: { templateId: "not-a-uuid" },
      }),
      400,
      "INVALID_WORKOUT_DATA",
    );

    await expectErrorMessage(
      await jsonRequest(app, "GET", "/workouts/not-a-uuid", {
        token: session.accessToken,
      }),
      400,
      "INVALID_WORKOUT_DATA",
    );

    await expectErrorMessage(
      await jsonRequest(app, "GET", "/workouts", {
        token: session.accessToken,
        query: { size: 0 },
      }),
      400,
      "INVALID_WORKOUT_DATA",
    );
  });

  it("get/finish неизвестной тренировки → WORKOUT_NOT_FOUND", async () => {
    const session = await signUp(app);

    await expectErrorCode(
      await jsonRequest(app, "GET", `/workouts/${MISSING_UUID}`, {
        token: session.accessToken,
      }),
      404,
      "WORKOUT_NOT_FOUND",
    );

    await expectErrorCode(
      await jsonRequest(app, "POST", `/workouts/${MISSING_UUID}/finish`, {
        token: session.accessToken,
      }),
      404,
      "WORKOUT_NOT_FOUND",
    );
  });

  it("операции на завершённой тренировке → WORKOUT_FINISHED", async () => {
    const { session, workout } = await seedActiveWorkout();
    const exercise = workout.exercises[0]!;
    const set = exercise.sets[0]!;

    await expectStatus(
      await jsonRequest(app, "POST", `/workouts/${workout.id}/finish`, {
        token: session.accessToken,
      }),
      200,
    );

    await expectErrorCode(
      await jsonRequest(app, "POST", `/workouts/${workout.id}/exercises/${exercise.id}/skip`, {
        token: session.accessToken,
      }),
      409,
      "WORKOUT_FINISHED",
    );

    await expectErrorCode(
      await jsonRequest(app, "POST", `/workouts/${workout.id}/exercises/${exercise.id}/sets`, {
        token: session.accessToken,
      }),
      409,
      "WORKOUT_FINISHED",
    );

    await expectErrorCode(
      await jsonRequest(
        app,
        "PATCH",
        `/workouts/${workout.id}/exercises/${exercise.id}/sets/${set.id}`,
        {
          token: session.accessToken,
          body: { status: "skipped" },
        },
      ),
      409,
      "WORKOUT_FINISHED",
    );
  });

  it("skip / add set / save set / ошибки set и exercise", async () => {
    const { session, workout } = await seedActiveWorkout();
    const exercise = workout.exercises[0]!;
    const set = exercise.sets[0]!;
    const secondSet = exercise.sets[1]!;

    const saved = await jsonRequest(
      app,
      "PATCH",
      `/workouts/${workout.id}/exercises/${exercise.id}/sets/${set.id}`,
      {
        token: session.accessToken,
        body: { status: "completed", parameterValues: { reps: 10 } },
      },
    );
    await expectStatus(saved, 200);

    await expectErrorCode(
      await jsonRequest(
        app,
        "PATCH",
        `/workouts/${workout.id}/exercises/${exercise.id}/sets/${set.id}`,
        {
          token: session.accessToken,
          body: { status: "completed", parameterValues: { reps: 1.5 } },
        },
      ),
      422,
      "INVALID_WORKOUT_SET_VALUES",
    );

    await expectErrorCode(
      await jsonRequest(
        app,
        "PATCH",
        `/workouts/${workout.id}/exercises/${exercise.id}/sets/${MISSING_UUID}`,
        {
          token: session.accessToken,
          body: { status: "skipped" },
        },
      ),
      404,
      "WORKOUT_SET_NOT_FOUND",
    );

    const added = await jsonRequest(
      app,
      "POST",
      `/workouts/${workout.id}/exercises/${exercise.id}/sets`,
      { token: session.accessToken },
    );
    await expectStatus(added, 201);

    const skipped = await jsonRequest(
      app,
      "POST",
      `/workouts/${workout.id}/exercises/${exercise.id}/skip`,
      { token: session.accessToken },
    );
    await expectStatus(skipped, 200);

    await expectErrorCode(
      await jsonRequest(app, "POST", `/workouts/${workout.id}/exercises/${exercise.id}/sets`, {
        token: session.accessToken,
      }),
      409,
      "WORKOUT_EXERCISE_SKIPPED",
    );

    await expectErrorCode(
      await jsonRequest(
        app,
        "PATCH",
        `/workouts/${workout.id}/exercises/${exercise.id}/sets/${secondSet.id}`,
        {
          token: session.accessToken,
          body: { status: "completed", parameterValues: { reps: 8 } },
        },
      ),
      409,
      "WORKOUT_EXERCISE_SKIPPED",
    );

    await expectErrorCode(
      await jsonRequest(app, "POST", `/workouts/${workout.id}/exercises/${MISSING_UUID}/skip`, {
        token: session.accessToken,
      }),
      404,
      "WORKOUT_EXERCISE_NOT_FOUND",
    );
  });

  it("save set с битой parameterSchema → INVALID_WORKOUT_PARAMETER_SCHEMA", async () => {
    const { session, workout } = await seedActiveWorkout();
    const exercise = workout.exercises[0]!;
    const set = exercise.sets[0]!;

    await testDb.pool.query(
      `
        UPDATE workout_exercises
        SET parameter_schema = $2::jsonb
        WHERE id = $1
      `,
      [exercise.id, JSON.stringify([{ key: "reps" }])],
    );

    await expectErrorCode(
      await jsonRequest(
        app,
        "PATCH",
        `/workouts/${workout.id}/exercises/${exercise.id}/sets/${set.id}`,
        {
          token: session.accessToken,
          body: { status: "completed", parameterValues: { reps: 10 } },
        },
      ),
      422,
      "INVALID_WORKOUT_PARAMETER_SCHEMA",
    );
  });

  it("чужая тренировка → WORKOUT_NOT_FOUND", async () => {
    const { workout } = await seedActiveWorkout();
    const other = await signUp(app);

    await expectErrorCode(
      await jsonRequest(app, "GET", `/workouts/${workout.id}`, {
        token: other.accessToken,
      }),
      404,
      "WORKOUT_NOT_FOUND",
    );
  });
});
