import { ExerciseCreateFailedException } from "../../../domain/exceptions/index.js";
import type { IExercise } from "../../../domain/interfaces/IExercise.js";
import type {
  CreateExerciseProps,
  IExercisesRepository,
} from "../../../domain/interfaces/IExercisesRepository.js";
import { validateParameterSchema } from "../validateParameterSchema.js";

export type CreateExerciseRequest = Omit<CreateExerciseProps, "parameterSchema"> & {
  parameterSchema: unknown;
};
export type CreateExerciseResponse = IExercise;

export class CreateExerciseUseCase {
  constructor(private readonly exercisesRepository: IExercisesRepository) {}

  async execute(
    userId: string,
    { parameterSchema, ...request }: CreateExerciseRequest,
  ): Promise<CreateExerciseResponse> {
    const exercise = await this.exercisesRepository.createExercise(userId, {
      ...request,
      parameterSchema: validateParameterSchema(parameterSchema),
    });

    if (!exercise) {
      throw new ExerciseCreateFailedException();
    }

    return exercise;
  }
}
