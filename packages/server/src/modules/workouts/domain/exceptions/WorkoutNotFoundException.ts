import { WorkoutException } from "./WorkoutException.js";

/** Тренировка не найдена. */
export class WorkoutNotFoundException extends WorkoutException {
  constructor() {
    super("WORKOUT_NOT_FOUND");
  }
}
