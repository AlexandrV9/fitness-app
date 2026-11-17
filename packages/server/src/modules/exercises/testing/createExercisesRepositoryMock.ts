import { vi } from "vitest";

import type { IExercisesRepository } from "../domain/interfaces/IExercisesRepository.js";

export function createExercisesRepositoryMock() {
  return {
    createExercise: vi.fn<IExercisesRepository["createExercise"]>(),
    updateExercise: vi.fn<IExercisesRepository["updateExercise"]>(),
    deleteExercise: vi.fn<IExercisesRepository["deleteExercise"]>(),
    getExerciseById: vi.fn<IExercisesRepository["getExerciseById"]>(),
    getExercises: vi.fn<IExercisesRepository["getExercises"]>(),
  };
}

export type ExercisesRepositoryMock = ReturnType<typeof createExercisesRepositoryMock>;
