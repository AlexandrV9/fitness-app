import type {
  GetExercisesProps,
  IExercisesRepository,
} from "../../../domain/interfaces/IExercisesRepository.js";

export class GetExercisesUseCase {
  constructor(private readonly repository: IExercisesRepository) {}

  execute(userId: string, filters: GetExercisesProps) {
    return this.repository.getExercises(userId, filters);
  }
}
