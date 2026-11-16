export type TemplateExerciseInputDto = {
  exerciseId: string;
  plannedSets: number | null;
};

export type TemplateExerciseDto = {
  id: string;
  name: string;
  position: number;
  exerciseId: string;
  plannedSets: number | null;
};
