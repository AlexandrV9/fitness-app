import { WorkoutException } from "./WorkoutException.js";

import type { WorkoutFieldError } from "../../application/utils/types/index.js";

/** Некорректные значения подхода. */
export class InvalidWorkoutSetValuesException extends WorkoutException {
  constructor(fields: WorkoutFieldError[] = []) {
    super("INVALID_WORKOUT_SET_VALUES", fields);
  }
}
