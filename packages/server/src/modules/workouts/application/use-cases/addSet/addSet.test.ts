import { describe, expect, it } from "vitest";

import { createWorkoutsRepositoryMock, userId, workout } from "../../../testing/index.js";
import { AddSetUseCase } from "./index.js";

describe("AddSetUseCase", () => {
  it("добавляет подход в упражнение", async () => {
    const createdSet = {
      id: "set-2",
      setNumber: 2,
      status: "pending" as const,
      parameterValues: {},
    };
    const { repository, changes } = createWorkoutsRepositoryMock(workout);
    changes.createSet.mockResolvedValue(createdSet);
    const useCase = new AddSetUseCase(repository);

    await expect(useCase.execute(userId, workout.id, "workout-exercise-1")).resolves.toEqual(
      createdSet,
    );
    expect(changes.createSet).toHaveBeenCalledExactlyOnceWith("workout-exercise-1");
  });

  it("не добавляет подходы после завершения тренировки", async () => {
    const { repository, changes } = createWorkoutsRepositoryMock({
      ...workout,
      finishedAt: new Date("2026-01-01T09:30:00Z"),
    });
    const useCase = new AddSetUseCase(repository);

    await expect(useCase.execute(userId, workout.id, "workout-exercise-1")).rejects.toMatchObject({
      code: "WORKOUT_FINISHED",
    });
    expect(changes.createSet).not.toHaveBeenCalled();
  });

  it("бросает WORKOUT_EXERCISE_SKIPPED для пропущенного упражнения", async () => {
    const { repository, changes } = createWorkoutsRepositoryMock({
      ...workout,
      exercises: [{ ...workout.exercises[0], isSkipped: true }],
    });
    const useCase = new AddSetUseCase(repository);

    await expect(useCase.execute(userId, workout.id, "workout-exercise-1")).rejects.toMatchObject({
      code: "WORKOUT_EXERCISE_SKIPPED",
    });
    expect(changes.createSet).not.toHaveBeenCalled();
  });
});
