/** Упражнение не найдено (по id и/или владельцу). */
export class ExerciseNotFoundException extends Error {
  constructor() {
    super('EXERCISE_NOT_FOUND')
    this.name = 'ExerciseNotFoundException'
  }
}
