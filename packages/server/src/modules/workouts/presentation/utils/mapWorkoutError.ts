import { HTTPException } from "hono/http-exception";
import { DatabaseError } from "pg";

import { WorkoutException } from "../../domain/exceptions/index.js";

import type { ClientErrorStatusCode } from "hono/utils/http-status";

const statuses: Record<string, ClientErrorStatusCode> = {
  USER_NOT_FOUND: 404,
  WORKOUT_TEMPLATE_NOT_FOUND: 404,
  WORKOUT_TEMPLATE_EXERCISE_NOT_FOUND: 404,
  WORKOUT_NOT_FOUND: 404,
  ACTIVE_WORKOUT_EXISTS: 409,
  WORKOUT_FINISHED: 409,
  WORKOUT_EXERCISE_NOT_FOUND: 404,
  WORKOUT_EXERCISE_SKIPPED: 409,
  WORKOUT_SET_NOT_FOUND: 404,
  INVALID_WORKOUT_PARAMETER_SCHEMA: 422,
  INVALID_WORKOUT_SET_VALUES: 422,
};

export function mapWorkoutError(error: Error): Error {
  if (error instanceof WorkoutException) {
    const status = statuses[error.code] ?? 400;
    const body =
      error.fields.length > 0 ? { code: error.code, fields: error.fields } : { code: error.code };

    return new HTTPException(status, {
      res: Response.json(body),
    });
  }

  if (
    error instanceof DatabaseError &&
    error.code === "23503" &&
    error.constraint === "workout_template_exercises_exercise_fk"
  ) {
    return new HTTPException(409, { message: "EXERCISE_USED_IN_WORKOUT_TEMPLATE" });
  }

  return error;
}
