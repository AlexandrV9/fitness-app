import { describe, expect, it } from "vitest";

import { createWorkoutsRepositoryMock, userId, workout } from "../../../testing/index.js";
import { DeleteSetUseCase } from "./index.js";

describe("DeleteSetUseCase", () => {
  it("удаляет подход из выбранного упражнения", async () => {
    const { repository, changes } = createWorkoutsRepositoryMock(workout);
    await new DeleteSetUseCase(repository).execute(
      userId,
      workout.id,
      "workout-exercise-1",
      "set-1",
    );
    expect(changes.deleteSet).toHaveBeenCalledExactlyOnceWith("workout-exercise-1", "set-1");
  });

  it("отклоняет подход, которого нет в выбранном упражнении", async () => {
    const { repository, changes } = createWorkoutsRepositoryMock(workout);
    await expect(
      new DeleteSetUseCase(repository).execute(
        userId,
        workout.id,
        "workout-exercise-1",
        "other-set",
      ),
    ).rejects.toMatchObject({ code: "WORKOUT_SET_NOT_FOUND" });
    expect(changes.deleteSet).not.toHaveBeenCalled();
  });

  it("разрешает удаление подхода в завершённой тренировке", async () => {
    const { repository, changes } = createWorkoutsRepositoryMock({
      ...workout,
      finishedAt: new Date(),
    });
    await new DeleteSetUseCase(repository).execute(
      userId,
      workout.id,
      "workout-exercise-1",
      "set-1",
    );
    expect(changes.deleteSet).toHaveBeenCalledExactlyOnceWith("workout-exercise-1", "set-1");
  });
});
