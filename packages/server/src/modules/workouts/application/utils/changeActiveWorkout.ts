import { WorkoutFinishedException } from "../../domain/exceptions/index.js";
import { changeWorkout } from "./changeWorkout.js";

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
  return changeWorkout(repository, userId, id, async (workout, changes) => {
    if (workout.finishedAt) {
      throw new WorkoutFinishedException();
    }

    return operation(workout, changes);
  });
}
