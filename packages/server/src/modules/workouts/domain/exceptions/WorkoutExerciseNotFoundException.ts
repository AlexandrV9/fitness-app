import { WorkoutException } from "./WorkoutException.js";

/** Упражнение внутри тренировки не найдено. */
export class WorkoutExerciseNotFoundException extends WorkoutException {
  constructor() {
    super("WORKOUT_EXERCISE_NOT_FOUND");
  }
}
