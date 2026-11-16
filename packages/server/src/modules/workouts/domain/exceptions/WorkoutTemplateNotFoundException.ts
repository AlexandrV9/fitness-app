import { WorkoutException } from "./WorkoutException.js";

/** Шаблон тренировки не найден. */
export class WorkoutTemplateNotFoundException extends WorkoutException {
  constructor() {
    super("WORKOUT_TEMPLATE_NOT_FOUND");
  }
}
