import { ExerciseNotFoundException } from "../../../domain/exceptions/index.js";
import { validateParameterSchema } from "../validateParameterSchema.js";

import type { IExercise } from "../../../domain/interfaces/IExercise.js";
import type {
  IExercisesRepository,
  UpdateExerciseProps,
} from "../../../domain/interfaces/IExercisesRepository.js";

export type UpdateExerciseRequest = Omit<UpdateExerciseProps, "parameterSchema"> & {
  parameterSchema?: unknown;
};

export class UpdateExerciseUseCase {
  constructor(private readonly exercisesRepository: IExercisesRepository) {}

  async execute(
    userId: string,
    { parameterSchema, ...request }: UpdateExerciseRequest,
  ): Promise<IExercise> {
    const exercise = await this.exercisesRepository.updateExercise(userId, {
      ...request,
      parameterSchema:
        parameterSchema === undefined ? undefined : validateParameterSchema(parameterSchema),
    });

    if (!exercise) {
      throw new ExerciseNotFoundException();
    }

    return exercise;
  }
}
