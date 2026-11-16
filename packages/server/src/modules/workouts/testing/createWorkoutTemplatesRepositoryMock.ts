import { vi } from "vitest";

import type { IWorkoutTemplatesRepository } from "../domain/repositories/IWorkoutTemplatesRepository.js";

export function createWorkoutTemplatesRepositoryMock() {
  return {
    getWorkoutTemplates: vi.fn<IWorkoutTemplatesRepository["getWorkoutTemplates"]>(),
    getWorkoutTemplate: vi.fn<IWorkoutTemplatesRepository["getWorkoutTemplate"]>(),
    createWorkoutTemplate: vi.fn<IWorkoutTemplatesRepository["createWorkoutTemplate"]>(),
    updateWorkoutTemplate: vi.fn<IWorkoutTemplatesRepository["updateWorkoutTemplate"]>(),
    deleteWorkoutTemplate: vi.fn<IWorkoutTemplatesRepository["deleteWorkoutTemplate"]>(),
  } satisfies IWorkoutTemplatesRepository;
}

export type WorkoutTemplatesRepositoryMock = ReturnType<
  typeof createWorkoutTemplatesRepositoryMock
>;
