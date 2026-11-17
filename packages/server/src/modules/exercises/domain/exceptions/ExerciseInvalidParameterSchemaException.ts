/** Некорректная схема параметров (ожидается массив) в упражнении. */
export class ExerciseInvalidParameterSchemaException extends Error {
  constructor() {
    super("EXERCISE_INVALID_PARAMETER_SCHEMA");
    this.name = "ExerciseInvalidParameterSchemaException";
  }
}
