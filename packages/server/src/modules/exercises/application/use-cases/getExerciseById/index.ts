import { ExerciseNotFoundException } from "../../../domain/exceptions/index.js";

import type { IExercise } from "../../../domain/interfaces/IExercise.js";
import type { IExercisesRepository } from "../../../domain/interfaces/IExercisesRepository.js";

export class GetExerciseByIdUseCase {
  constructor(private readonly exercisesRepository: IExercisesRepository) {}

  async execute(userId: string, exerciseId: string): Promise<IExercise> {
    const exercise = await this.exercisesRepository.getExerciseById(userId, exerciseId);

    if (!exercise) {
      throw new ExerciseNotFoundException();
    }

    return exercise;
  }
}
