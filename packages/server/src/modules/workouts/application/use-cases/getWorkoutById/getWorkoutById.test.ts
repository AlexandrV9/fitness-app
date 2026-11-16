import { beforeEach, describe, expect, it } from "vitest";

import { createWorkoutsRepositoryMock, userId, workout } from "../../../testing/index.js";
import { GetWorkoutByIdUseCase } from "./index.js";

describe("GetWorkoutByIdUseCase", () => {
  const { repository } = createWorkoutsRepositoryMock();
  const useCase = new GetWorkoutByIdUseCase(repository);

  beforeEach(() => {
    repository.getWorkoutById.mockReset();
  });

  it("возвращает тренировку по id", async () => {
    repository.getWorkoutById.mockResolvedValue(workout);

    await expect(useCase.execute(userId, workout.id)).resolves.toEqual(workout);
    expect(repository.getWorkoutById).toHaveBeenCalledExactlyOnceWith({
      userId,
      workoutId: workout.id,
    });
  });

  it("бросает WORKOUT_NOT_FOUND, если тренировка не найдена", async () => {
    repository.getWorkoutById.mockResolvedValue(null);

    await expect(useCase.execute(userId, workout.id)).rejects.toMatchObject({
      code: "WORKOUT_NOT_FOUND",
    });
  });
});
