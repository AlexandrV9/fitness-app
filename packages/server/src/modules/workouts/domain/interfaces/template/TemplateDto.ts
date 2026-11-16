import type { TemplateExerciseInputDto } from "./TemplateExerciseDto.js";

export type WorkoutTemplateDto = {
  id: string;
  userId: string;
  name: string;
};

export type WorkoutTemplateInputDto = {
  name: string;
  exercises: TemplateExerciseInputDto[];
};
