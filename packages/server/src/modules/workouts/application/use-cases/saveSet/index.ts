import {
  WorkoutExerciseSkippedException,
  WorkoutSetNotFoundException,
} from "../../../domain/exceptions/index.js";
import { changeWorkout } from "../../utils/changeWorkout.js";
import { findExerciseInWorkout } from "../../utils/findExerciseInWorkout.js";
import { validateSetValues } from "../../utils/validateSetValues.js";

import type { SetResultInput } from "../../../domain/interfaces/set/SetDto.js";
import type { IWorkoutsRepository } from "../../../domain/repositories/IWorkoutsRepository.js";

export class SaveSetUseCase {
  constructor(private readonly repository: IWorkoutsRepository) {}

  execute(userId: string, id: string, exerciseId: string, setId: string, input: SetResultInput) {
    return changeWorkout(this.repository, userId, id, async (workout, changes) => {
      const exercise = findExerciseInWorkout(workout, exerciseId);

      if (exercise.isSkipped) {
        throw new WorkoutExerciseSkippedException();
      }

      if (!exercise.sets.some((set) => set.id === setId)) {
        throw new WorkoutSetNotFoundException();
      }

      const parameterValues =
        input.status === "skipped"
          ? {}
          : validateSetValues(
              exercise.parameterSchema,
              input.parameterValues,
              input.status === "pending",
            );

      return changes.updateSet(setId, { status: input.status, parameterValues });
    });
  }
}
