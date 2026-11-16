import { WorkoutException } from "./WorkoutException.js";

/** Упражнение пропущено, изменение запрещено. */
export class WorkoutExerciseSkippedException extends WorkoutException {
  constructor() {
    super("WORKOUT_EXERCISE_SKIPPED");
  }
}
