import {
  WorkoutExerciseSkippedException,
  WorkoutSetNotFoundException,
} from "../../../domain/exceptions/index.js";
import { changeActiveWorkout } from "../../utils/changeActiveWorkout.js";
import { findExerciseInWorkout } from "../../utils/findExerciseInWorkout.js";
import { validateSetValues } from "../../utils/validateSetValues.js";

import type { SetResultInput } from "../../../domain/interfaces/set/SetDto.js";
import type { IWorkoutsRepository } from "../../../domain/repositories/IWorkoutsRepository.js";

export class SaveSetUseCase {
  constructor(private readonly repository: IWorkoutsRepository) {}

  execute(userId: string, id: string, exerciseId: string, setId: string, input: SetResultInput) {
    return changeActiveWorkout(this.repository, userId, id, async (workout, changes) => {
      const exercise = findExerciseInWorkout(workout, exerciseId);

      if (exercise.isSkipped) {
        throw new WorkoutExerciseSkippedException();
      }

      if (!exercise.sets.some((set) => set.id === setId)) {
        throw new WorkoutSetNotFoundException();
      }

      const parameterValues =
        input.status === "completed"
          ? validateSetValues(exercise.parameterSchema, input.parameterValues)
          : {};

      return changes.updateSet(setId, { status: input.status, parameterValues });
    });
  }
}
