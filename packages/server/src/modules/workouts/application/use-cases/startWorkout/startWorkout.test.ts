import { beforeEach, describe, expect, it } from "vitest";

import { createWorkoutsRepositoryMock, userId, workout } from "../../../testing/index.js";
import { StartWorkoutUseCase } from "./index.js";

describe("StartWorkoutUseCase", () => {
  const { repository } = createWorkoutsRepositoryMock();
  const useCase = new StartWorkoutUseCase(repository);

  beforeEach(() => {
    repository.startWorkout.mockReset();
  });

  it("запускает тренировку по шаблону", async () => {
    const started = { workout, created: true };
    repository.startWorkout.mockResolvedValue(started);

    await expect(useCase.execute(userId, "template-1")).resolves.toEqual(started);
    expect(repository.startWorkout).toHaveBeenCalledExactlyOnceWith({
      userId,
      templateId: "template-1",
    });
  });
});
