import { WorkoutException } from "./WorkoutException.js";

/** Подход не найден. */
export class WorkoutSetNotFoundException extends WorkoutException {
  constructor() {
    super("WORKOUT_SET_NOT_FOUND");
  }
}
