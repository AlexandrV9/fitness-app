import { WorkoutException } from "./WorkoutException.js";

import type { WorkoutFieldError } from "../../application/utils/types/index.js";

/** Некорректная схема параметров упражнения в тренировке. */
export class InvalidWorkoutParameterSchemaException extends WorkoutException {
  constructor(fields: WorkoutFieldError[] = []) {
    super("INVALID_WORKOUT_PARAMETER_SCHEMA", fields);
  }
}
