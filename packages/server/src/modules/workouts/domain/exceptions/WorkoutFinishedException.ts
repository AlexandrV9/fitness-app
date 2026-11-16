import { WorkoutException } from "./WorkoutException.js";

/** Тренировка уже завершена. */
export class WorkoutFinishedException extends WorkoutException {
  constructor() {
    super("WORKOUT_FINISHED");
  }
}
