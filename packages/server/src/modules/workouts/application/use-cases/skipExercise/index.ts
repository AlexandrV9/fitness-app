import { changeActiveWorkout } from "../../utils/changeActiveWorkout.js";
import { findExerciseInWorkout } from "../../utils/findExerciseInWorkout.js";

import type { IWorkoutsRepository } from "../../../domain/repositories/IWorkoutsRepository.js";

export class SkipExerciseUseCase {
  constructor(private readonly repository: IWorkoutsRepository) {}

  execute(userId: string, id: string, exerciseId: string) {
    return changeActiveWorkout(this.repository, userId, id, async (workout, changes) => {
      const exercise = findExerciseInWorkout(workout, exerciseId);
      return exercise.isSkipped ? workout : changes.skipExercise(exerciseId);
    });
  }
}
