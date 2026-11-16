import { WorkoutException } from "./WorkoutException.js";

/** Уже есть активная тренировка с другим шаблоном. */
export class ActiveWorkoutExistsException extends WorkoutException {
  constructor() {
    super("ACTIVE_WORKOUT_EXISTS");
  }
}
