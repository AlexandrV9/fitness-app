import type { IWorkoutsRepository } from "../../../domain/repositories/IWorkoutsRepository.js";

export class StartWorkoutUseCase {
  constructor(private readonly repository: IWorkoutsRepository) {}

  execute(userId: string, templateId: string) {
    return this.repository.startWorkout({ userId, templateId });
  }
}
