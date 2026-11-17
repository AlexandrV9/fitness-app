import { WorkoutNotFoundException } from "../../../domain/exceptions/index.js";

import type { IWorkoutsRepository } from "../../../domain/repositories/IWorkoutsRepository.js";

export class FinishWorkoutUseCase {
  constructor(private readonly repository: IWorkoutsRepository) {}

  async execute(userId: string, id: string) {
    const workout = await this.repository.changeWorkout({
      userId,
      id,
      operation: async (workout, changes) => (workout.finishedAt ? workout : changes.finish()),
    });

    if (!workout) {
      throw new WorkoutNotFoundException();
    }

    return workout;
  }
}
