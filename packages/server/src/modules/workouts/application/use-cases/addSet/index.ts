import { changeActiveWorkout } from "../../utils/changeActiveWorkout.js";
import { findExerciseInWorkout } from "../../utils/findExerciseInWorkout.js";

import type { IWorkoutsRepository } from "../../../domain/repositories/IWorkoutsRepository.js";
import { WorkoutExerciseSkippedException } from "../../../domain/exceptions/index.js";


export class AddSetUseCase {
  constructor(private readonly repository: IWorkoutsRepository) {}

  execute(userId: string, id: string, exerciseId: string) {
    return changeActiveWorkout(this.repository, userId, id, async (workout, changes) => {
      const exercise = findExerciseInWorkout(workout, exerciseId);

      if (exercise.isSkipped) {
        throw new WorkoutExerciseSkippedException();
      }

      return changes.createSet(exerciseId);
    });
  }
}
