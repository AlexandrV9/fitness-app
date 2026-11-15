/** Владелец упражнения не найден (нарушение внешнего ключа на users). */
export class ExerciseOwnerNotFoundException extends Error {
  constructor() {
    super('EXERCISE_OWNER_NOT_FOUND')
    this.name = 'ExerciseOwnerNotFoundException'
  }
}
