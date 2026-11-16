import type { SetDto } from "../set/SetDto.js";

/**
 * Упражнение внутри конкретной тренировки со списком подходов (sets)
 */
export type WorkoutExerciseDto = {
  id: string;
  exerciseId: string | null;
  name: string;
  position: number;
  isSkipped: boolean;
  /**
   * Набор параметров для подходап
   * Описывает что можно/нужно заполнять, правила: ключи, типы, min/max и т.д
   * Например: weight, reps
   */
  parameterSchema: unknown[];
  /**
   * подходы
   */
  sets: SetDto[];
};
