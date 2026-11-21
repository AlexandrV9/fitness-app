import { describe, expect, it } from "vitest";

import { createWorkoutsRepositoryMock, userId, workout } from "../../../testing/index.js";
import { SaveSetUseCase } from "./index.js";

describe("SaveSetUseCase", () => {
  it("сохраняет результат по схеме упражнения, записанной в тренировке", async () => {
    const { repository, changes } = createWorkoutsRepositoryMock(workout);
    const result = { status: "completed" as const, parameterValues: { reps: 12 } };
    const savedSet = { ...workout.exercises[0].sets[0], ...result };
    changes.updateSet.mockResolvedValue(savedSet);
    const useCase = new SaveSetUseCase(repository);

    await expect(
      useCase.execute(userId, workout.id, "workout-exercise-1", "set-1", result),
    ).resolves.toEqual(savedSet);
    expect(changes.updateSet).toHaveBeenCalledExactlyOnceWith("set-1", result);
  });

  it("отклоняет дробное число повторений до записи результата", async () => {
    const { repository, changes } = createWorkoutsRepositoryMock(workout);
    const useCase = new SaveSetUseCase(repository);

    await expect(
      useCase.execute(userId, workout.id, "workout-exercise-1", "set-1", {
        status: "completed",
        parameterValues: { reps: 1.5 },
      }),
    ).rejects.toMatchObject({ code: "INVALID_WORKOUT_SET_VALUES" });
    expect(changes.updateSet).not.toHaveBeenCalled();
  });

  it("сохраняет незаполненный подход как черновик", async () => {
    const { repository, changes } = createWorkoutsRepositoryMock(workout);
    await new SaveSetUseCase(repository).execute(
      userId,
      workout.id,
      "workout-exercise-1",
      "set-1",
      {
        status: "pending",
        parameterValues: {},
      },
    );
    expect(changes.updateSet).toHaveBeenCalledExactlyOnceWith("set-1", {
      status: "pending",
      parameterValues: {},
    });
  });

  it("требует обязательные поля при завершении подхода", async () => {
    const { repository, changes } = createWorkoutsRepositoryMock(workout);
    await expect(
      new SaveSetUseCase(repository).execute(userId, workout.id, "workout-exercise-1", "set-1", {
        status: "completed",
        parameterValues: {},
      }),
    ).rejects.toMatchObject({ code: "INVALID_WORKOUT_SET_VALUES" });
    expect(changes.updateSet).not.toHaveBeenCalled();
  });

  it("отклоняет значения выше 999 даже в черновике", async () => {
    const { repository, changes } = createWorkoutsRepositoryMock(workout);
    await expect(
      new SaveSetUseCase(repository).execute(userId, workout.id, "workout-exercise-1", "set-1", {
        status: "pending",
        parameterValues: { reps: 1000 },
      }),
    ).rejects.toMatchObject({ code: "INVALID_WORKOUT_SET_VALUES" });
    expect(changes.updateSet).not.toHaveBeenCalled();
  });

  it("бросает WORKOUT_SET_NOT_FOUND, если подхода нет в упражнении", async () => {
    const { repository, changes } = createWorkoutsRepositoryMock(workout);
    const useCase = new SaveSetUseCase(repository);

    await expect(
      useCase.execute(userId, workout.id, "workout-exercise-1", "missing-set", {
        status: "skipped",
      }),
    ).rejects.toMatchObject({ code: "WORKOUT_SET_NOT_FOUND" });
    expect(changes.updateSet).not.toHaveBeenCalled();
  });
});
