import type { WorkoutDto } from "./WorkoutDto.js";
import type { WorkoutExerciseDto } from "./WorkoutExerciseDto.js";

export type WorkoutDetailDto = WorkoutDto & { exercises: WorkoutExerciseDto[] };
