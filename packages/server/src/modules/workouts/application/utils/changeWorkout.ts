import { WorkoutNotFoundException } from "../../domain/exceptions/index.js";

import type { WorkoutDetailDto } from "../../domain/interfaces/workout/WorkoutDetailDto.js";
import type {
  IWorkoutsRepository,
  WorkoutChanges,
} from "../../domain/repositories/IWorkoutsRepository.js";

export async function changeWorkout<T>(
  repository: IWorkoutsRepository,
  userId: string,
  id: string,
  operation: (workout: WorkoutDetailDto, changes: WorkoutChanges) => Promise<T>,
) {
  const result = await repository.changeWorkout({
    userId,
    id,
    operation,
  });

  if (result === null) {
    throw new WorkoutNotFoundException();
  }

  return result;
}
