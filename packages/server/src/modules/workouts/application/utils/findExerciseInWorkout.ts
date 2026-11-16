import { WorkoutExerciseNotFoundException } from "../../domain/exceptions/index.js";

import type { WorkoutDetailDto } from "../../domain/interfaces/workout/WorkoutDetailDto.js";

export function findExerciseInWorkout(workout: WorkoutDetailDto, exerciseId: string) {
  const exercise = workout.exercises.find((item) => item.id === exerciseId);

  if (!exercise) {
    throw new WorkoutExerciseNotFoundException();
  }

  return exercise;
}
