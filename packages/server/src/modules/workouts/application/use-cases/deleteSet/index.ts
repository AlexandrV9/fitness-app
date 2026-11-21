import {
  WorkoutExerciseSkippedException,
  WorkoutSetNotFoundException,
} from "../../../domain/exceptions/index.js";
import { changeWorkout } from "../../utils/changeWorkout.js";
import { findExerciseInWorkout } from "../../utils/findExerciseInWorkout.js";

import type { IWorkoutsRepository } from "../../../domain/repositories/IWorkoutsRepository.js";

export class DeleteSetUseCase {
  constructor(private readonly repository: IWorkoutsRepository) {}

  execute(userId: string, id: string, exerciseId: string, setId: string) {
    return changeWorkout(this.repository, userId, id, async (workout, changes) => {
      const exercise = findExerciseInWorkout(workout, exerciseId);
      if (exercise.isSkipped) throw new WorkoutExerciseSkippedException();
      if (!exercise.sets.some((set) => set.id === setId)) throw new WorkoutSetNotFoundException();
      await changes.deleteSet(exerciseId, setId);
    });
  }
}
