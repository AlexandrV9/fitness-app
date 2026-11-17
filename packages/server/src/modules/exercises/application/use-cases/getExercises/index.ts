import type {
  GetExercisesProps,
  IExercisesRepository,
} from "../../../domain/interfaces/IExercisesRepository.js";

export class GetExercisesUseCase {
  constructor(private readonly repository: IExercisesRepository) {}

  execute(userId: string, pagination: GetExercisesProps) {
    return this.repository.getExercises(userId, pagination);
  }
}
