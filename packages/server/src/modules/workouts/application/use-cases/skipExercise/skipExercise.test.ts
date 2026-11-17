import { describe, expect, it } from "vitest";

import { createWorkoutsRepositoryMock, userId, workout } from "../../../testing/index.js";
import { SkipExerciseUseCase } from "./index.js";

describe("SkipExerciseUseCase", () => {
  it("пропускает упражнение", async () => {
    const skipped = {
      ...workout,
      exercises: [{ ...workout.exercises[0], isSkipped: true }],
    };
    const { repository, changes } = createWorkoutsRepositoryMock(workout);
    changes.skipExercise.mockResolvedValue(skipped);
    const useCase = new SkipExerciseUseCase(repository);

    await expect(useCase.execute(userId, workout.id, "workout-exercise-1")).resolves.toEqual(
      skipped,
    );
    expect(changes.skipExercise).toHaveBeenCalledExactlyOnceWith("workout-exercise-1");
  });

  it("не вызывает skip, если упражнение уже пропущено", async () => {
    const skippedWorkout = {
      ...workout,
      exercises: [{ ...workout.exercises[0], isSkipped: true }],
    };
    const { repository, changes } = createWorkoutsRepositoryMock(skippedWorkout);
    const useCase = new SkipExerciseUseCase(repository);

    await expect(useCase.execute(userId, skippedWorkout.id, "workout-exercise-1")).resolves.toEqual(
      skippedWorkout,
    );
    expect(changes.skipExercise).not.toHaveBeenCalled();
  });

  it("бросает WORKOUT_FINISHED для завершённой тренировки", async () => {
    const { repository, changes } = createWorkoutsRepositoryMock({
      ...workout,
      finishedAt: new Date("2026-01-01T10:00:00Z"),
    });
    const useCase = new SkipExerciseUseCase(repository);

    await expect(useCase.execute(userId, workout.id, "workout-exercise-1")).rejects.toMatchObject({
      code: "WORKOUT_FINISHED",
    });
    expect(changes.skipExercise).not.toHaveBeenCalled();
  });
});
