
import type { IWorkoutsRepository } from "../../../domain/repositories/IWorkoutsRepository.js";
import { WorkoutNotFoundException } from "../../../domain/exceptions/index.js";


export class GetWorkoutByIdUseCase {
  constructor(private readonly repository: IWorkoutsRepository) {}

  async execute(userId: string, workoutId: string) {
    const workout = await this.repository.getWorkoutById({ userId, workoutId });

    if (!workout) {
      throw new WorkoutNotFoundException();
    }

    return workout;
  }
}
