import { describe, expect, it } from "vitest";

import { createWorkoutsRepositoryMock, userId, workout } from "../../../testing/index.js";
import { FinishWorkoutUseCase } from "./index.js";

describe("FinishWorkoutUseCase", () => {
  it("завершает активную тренировку", async () => {
    const finished = { ...workout, finishedAt: new Date("2026-01-01T10:00:00Z") };
    const { repository, changes } = createWorkoutsRepositoryMock(workout);
    changes.finish.mockResolvedValue(finished);
    const useCase = new FinishWorkoutUseCase(repository);

    await expect(useCase.execute(userId, workout.id)).resolves.toEqual(finished);
    expect(changes.finish).toHaveBeenCalledOnce();
  });

  it("возвращает уже завершённую тренировку без повторного finish", async () => {
    const finished = { ...workout, finishedAt: new Date("2026-01-01T10:00:00Z") };
    const { repository, changes } = createWorkoutsRepositoryMock(finished);
    const useCase = new FinishWorkoutUseCase(repository);

    await expect(useCase.execute(userId, finished.id)).resolves.toEqual(finished);
    expect(changes.finish).not.toHaveBeenCalled();
  });

  it("бросает WORKOUT_NOT_FOUND, если тренировка не найдена", async () => {
    const { repository } = createWorkoutsRepositoryMock();
    const useCase = new FinishWorkoutUseCase(repository);

    await expect(useCase.execute(userId, workout.id)).rejects.toMatchObject({
      code: "WORKOUT_NOT_FOUND",
    });
  });
});
