import { sign } from "hono/jwt";
import { randomUUID } from "node:crypto";

import { config } from "~/config/index.js";

import { expectErrorMessage, jsonRequest, readJson, type TestApp } from "./http.js";

export type AuthSession = {
  accessToken: string;
  refreshToken: string;
  user: { id: string; login: string };
};

export const uniqueLogin = (prefix = "user") =>
  `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

export const signUp = async (
  app: TestApp,
  input?: { login?: string; password?: string },
): Promise<AuthSession> => {
  const login = input?.login ?? uniqueLogin();
  const password = input?.password ?? "password1";

  const response = await jsonRequest(app, "POST", "/auth/sign-up", {
    body: { login, password },
  });

  if (response.status !== 201) {
    throw new Error(`signUp failed (${response.status}): ${await response.text()}`);
  }

  const body = await readJson<{ success: true; data: AuthSession }>(response);
  return body.data;
};

export const signIn = async (app: TestApp, login: string, password: string) => {
  const response = await jsonRequest(app, "POST", "/auth/sign-in", {
    body: { login, password },
  });
  const body = await readJson<{ success: true; data: AuthSession }>(response);
  return { response, data: body.data };
};

export const createExercise = async (
  app: TestApp,
  token: string,
  input?: {
    name?: string;
    parameterSchema?: unknown[];
  },
) => {
  const response = await jsonRequest(app, "POST", "/exercises", {
    token,
    body: {
      name: input?.name ?? "Bench Press",
      parameterSchema: input?.parameterSchema ?? [
        { key: "weight_kg", type: "number", min: 0 },
        { key: "reps", type: "integer", min: 1 },
      ],
    },
  });

  if (response.status !== 201) {
    throw new Error(`createExercise failed (${response.status}): ${await response.text()}`);
  }

  const body = await readJson<{ success: true; data: { id: string; name: string } }>(response);
  return body.data;
};

export const createTemplate = async (
  app: TestApp,
  token: string,
  exerciseId: string,
  input?: { name?: string; plannedSets?: number },
) => {
  const response = await jsonRequest(app, "POST", "/workout-templates", {
    token,
    body: {
      name: input?.name ?? "Push day",
      exercises: [{ exerciseId, plannedSets: input?.plannedSets ?? 2 }],
    },
  });

  if (response.status !== 201) {
    throw new Error(`createTemplate failed (${response.status}): ${await response.text()}`);
  }

  const body = await readJson<{
    success: true;
    data: { id: string; name: string; exercises: Array<{ id: string; exerciseId: string }> };
  }>(response);
  return body.data;
};

export const startWorkout = async (app: TestApp, token: string, templateId: string) => {
  const response = await jsonRequest(app, "POST", "/workouts/start", {
    token,
    body: { templateId },
  });

  if (response.status !== 201 && response.status !== 200) {
    throw new Error(`startWorkout failed (${response.status}): ${await response.text()}`);
  }

  const body = await readJson<{
    success: true;
    data: {
      id: string;
      finishedAt: string | null;
      exercises: Array<{
        id: string;
        sets: Array<{ id: string; setNumber: number; status: string }>;
      }>;
    };
  }>(response);

  return { response, workout: body.data };
};

export const expectUnauthorized = async (response: Response) => {
  await expectErrorMessage(response, 401, "Unauthorized");
};

/** Access JWT with past `exp` for auth middleware expiry checks. */
export const expiredAccessToken = (user: { id: string; login: string }) =>
  sign(
    {
      data: user,
      jti: randomUUID(),
      exp: Math.floor(Date.now() / 1000) - 60,
    },
    config.auth.accessToken.secret,
    "HS256",
  );
