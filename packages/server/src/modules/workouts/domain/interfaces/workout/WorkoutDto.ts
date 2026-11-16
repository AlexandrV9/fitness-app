/**
 * Одна тренировка
 */
export type WorkoutDto = {
  id: string;
  userId: string;
  templateId: string | null;
  templateName: string;
  startedAt: Date;
  finishedAt: Date | null;
};
