import type { WorkoutFieldError } from "../../application/utils/types/index.js";

/** Базовое доменное исключение модуля workouts. */
export class WorkoutException extends Error {
  constructor(
    readonly code: string,
    readonly fields: WorkoutFieldError[] = [],
  ) {
    super(code);
    this.name = new.target.name;
  }
}
