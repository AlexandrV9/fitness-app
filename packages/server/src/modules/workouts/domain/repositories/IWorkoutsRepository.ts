import type { PaginatedResult } from "~/shared/lib/pagination.js";

import type { SetDto, SetResult } from "../interfaces/set/SetDto.js";
import type { WorkoutDetailDto } from "../interfaces/workout/WorkoutDetailDto.js";
import type { WorkoutDto } from "../interfaces/workout/WorkoutDto.js";

export interface WorkoutChanges {
  finish(): Promise<WorkoutDetailDto>;
  skipExercise(exerciseId: string): Promise<WorkoutDetailDto>;
  createSet(exerciseId: string): Promise<SetDto>;
  updateSet(setId: string, result: SetResult): Promise<SetDto>;
}

export type GetWorkoutsProps = {
  userId: string;
  page: number;
  size: number;
};

export type GetWorkoutByIdProps = {
  userId: string;
  workoutId: string;
};

export type GetActiveWorkoutProps = {
  userId: string;
};

export type StartWorkoutProps = {
  userId: string;
  templateId: string;
};

export type ChangeWorkoutProps<T> = {
  userId: string;
  id: string;
  operation: (workout: WorkoutDetailDto, changes: WorkoutChanges) => Promise<T>;
};

export interface IWorkoutsRepository {
  getWorkouts(data: GetWorkoutsProps): Promise<PaginatedResult<WorkoutDto>>;
  getWorkoutById(data: GetWorkoutByIdProps): Promise<WorkoutDetailDto | null>;
  getActiveWorkout(data: GetActiveWorkoutProps): Promise<WorkoutDetailDto | null>;
  startWorkout(data: StartWorkoutProps): Promise<{
    workout: WorkoutDetailDto;
    created: boolean;
  }>;
  changeWorkout<T>(data: ChangeWorkoutProps<T>): Promise<T | null>;
}
