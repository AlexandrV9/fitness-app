import type { IWorkoutsRepository } from "../../../domain/repositories/IWorkoutsRepository.js";

export class GetActiveWorkoutUseCase {
  constructor(private readonly repository: IWorkoutsRepository) {}

  execute(userId: string) {
    return this.repository.getActiveWorkout({ userId });
  }
}
