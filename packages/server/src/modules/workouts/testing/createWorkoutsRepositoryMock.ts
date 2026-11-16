import { vi } from "vitest";

import type { WorkoutDetailDto } from "../domain/interfaces/workout/WorkoutDetailDto.js";
import type {
  ChangeWorkoutProps,
  IWorkoutsRepository,
  WorkoutChanges,
} from "../domain/repositories/IWorkoutsRepository.js";

export function createWorkoutChangesMock() {
  return {
    finish: vi.fn<WorkoutChanges["finish"]>(),
    skipExercise: vi.fn<WorkoutChanges["skipExercise"]>(),
    createSet: vi.fn<WorkoutChanges["createSet"]>(),
    updateSet: vi.fn<WorkoutChanges["updateSet"]>(),
  };
}

export function createWorkoutsRepositoryMock(currentWorkout?: WorkoutDetailDto) {
  const changes = createWorkoutChangesMock();

  const repository = {
    getWorkouts: vi.fn<IWorkoutsRepository["getWorkouts"]>(),
    getWorkoutById: vi.fn<IWorkoutsRepository["getWorkoutById"]>(),
    getActiveWorkout: vi.fn<IWorkoutsRepository["getActiveWorkout"]>(),
    startWorkout: vi.fn<IWorkoutsRepository["startWorkout"]>(),
    async changeWorkout<T>({ operation }: ChangeWorkoutProps<T>): Promise<T | null> {
      if (!currentWorkout) return null;
      return operation(currentWorkout, changes);
    },
  };

  return { repository, changes };
}

export type WorkoutsRepositoryMock = ReturnType<typeof createWorkoutsRepositoryMock>["repository"];
