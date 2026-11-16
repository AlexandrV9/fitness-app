import {
  WorkoutFinishedException,
  WorkoutNotFoundException,
} from "../../domain/exceptions/index.js";

import type { WorkoutDetailDto } from "../../domain/interfaces/workout/WorkoutDetailDto.js";
import type {
  IWorkoutsRepository,
  WorkoutChanges,
} from "../../domain/repositories/IWorkoutsRepository.js";

export async function changeActiveWorkout<T>(
  repository: IWorkoutsRepository,
  userId: string,
  id: string,
  operation: (workout: WorkoutDetailDto, changes: WorkoutChanges) => Promise<T>,
) {
  const result = await repository.changeWorkout({
    userId,
    id,
    operation: (workout, changes) => {
      if (workout.finishedAt) {
        throw new WorkoutFinishedException();
      }

      return operation(workout, changes);
    },
  });

  if (result === null) {
    throw new WorkoutNotFoundException();
  }

  return result;
}
