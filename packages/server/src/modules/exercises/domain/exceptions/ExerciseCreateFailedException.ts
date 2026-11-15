/** Упражнение не удалось создать (репозиторий не вернул запись). */
export class ExerciseCreateFailedException extends Error {
  constructor() {
    super("EXERCISE_CREATE_FAILED");
    this.name = "ExerciseCreateFailedException";
  }
}
