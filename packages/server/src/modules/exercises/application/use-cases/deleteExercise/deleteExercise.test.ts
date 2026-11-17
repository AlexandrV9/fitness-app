import { beforeEach, describe, expect, it } from "vitest";

import { ExerciseNotFoundException } from "../../../domain/exceptions/index.js";
import { createExercisesRepositoryMock, exercise, userId } from "../../../testing/index.js";
import { DeleteExerciseUseCase } from "./index.js";

describe("DeleteExerciseUseCase", () => {
  const repository = createExercisesRepositoryMock();
  const useCase = new DeleteExerciseUseCase(repository);

  beforeEach(() => {
    repository.deleteExercise.mockReset();
  });

  it("Удаление упражнения по его id и id владельца", async () => {
    repository.deleteExercise.mockResolvedValue(true);

    await useCase.execute(userId, exercise.id);

    expect(repository.deleteExercise).toHaveBeenCalledExactlyOnceWith(userId, exercise.id);
  });

  it("Проверка выброса исключения, если упражнение не найдено", async () => {
    repository.deleteExercise.mockResolvedValue(false);

    await expect(useCase.execute(userId, exercise.id)).rejects.toThrow(ExerciseNotFoundException);
  });
});
