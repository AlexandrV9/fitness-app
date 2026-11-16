import type { WorkoutTemplateDto } from "./TemplateDto.js";
import type { TemplateExerciseDto } from "./TemplateExerciseDto.js";

export type WorkoutTemplateDetailDto = WorkoutTemplateDto & { exercises: TemplateExerciseDto[] };
