import { HTTPException } from 'hono/http-exception'

import { ExerciseNotFoundException } from '../../../domain/exceptions/index.js'
import type { IExercisesRepository } from '../../../domain/interfaces/IExercisesRepository.js'

export class DeleteExerciseUseCase {
  constructor(private readonly exercisesRepository: IExercisesRepository) {}

  async execute(userId: string, exerciseId: string): Promise<void> {
    const deleted = await this.exercisesRepository.deleteExercise(
      userId,
      exerciseId,
    )

    if (!deleted) {
      throw new HTTPException(404, {
        message: new ExerciseNotFoundException().message,
      })
    }
  }
}
