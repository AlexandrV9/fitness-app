import { WorkoutException } from "./WorkoutException.js";

/** Упражнение шаблона не найдено / не принадлежит пользователю. */
export class WorkoutTemplateExerciseNotFoundException extends WorkoutException {
  constructor() {
    super("WORKOUT_TEMPLATE_EXERCISE_NOT_FOUND");
  }
}
