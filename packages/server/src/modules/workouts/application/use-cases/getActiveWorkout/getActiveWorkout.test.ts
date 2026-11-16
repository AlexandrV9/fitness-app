import { beforeEach, describe, expect, it } from "vitest";

import { createWorkoutsRepositoryMock, userId, workout } from "../../../testing/index.js";
import { GetActiveWorkoutUseCase } from "./index.js";

describe("GetActiveWorkoutUseCase", () => {
  const { repository } = createWorkoutsRepositoryMock();
  const useCase = new GetActiveWorkoutUseCase(repository);

  beforeEach(() => {
    repository.getActiveWorkout.mockReset();
  });

  it("возвращает активную тренировку", async () => {
    repository.getActiveWorkout.mockResolvedValue(workout);

    await expect(useCase.execute(userId)).resolves.toEqual(workout);
    expect(repository.getActiveWorkout).toHaveBeenCalledExactlyOnceWith({ userId });
  });

  it("возвращает null, если активной тренировки нет", async () => {
    repository.getActiveWorkout.mockResolvedValue(null);

    await expect(useCase.execute(userId)).resolves.toBeNull();
  });
});
