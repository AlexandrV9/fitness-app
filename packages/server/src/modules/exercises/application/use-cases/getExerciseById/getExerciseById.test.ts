import { HTTPException } from "hono/http-exception";
import { beforeEach, describe, expect, it } from "vitest";

import { createExercisesRepositoryMock, exercise, userId } from "../../../testing/index.js";
import { GetExerciseByIdUseCase } from "./index.js";

describe("GetExerciseByIdUseCase", () => {
  const repository = createExercisesRepositoryMock();
  const useCase = new GetExerciseByIdUseCase(repository);

  beforeEach(() => {
    repository.getExerciseById.mockReset();
  });

  it("Получение упражнения по его id и id владельца", async () => {
    repository.getExerciseById.mockResolvedValue(exercise);

    const result = await useCase.execute(userId, exercise.id);

    expect(result).toEqual(exercise);
    expect(repository.getExerciseById).toHaveBeenCalledExactlyOnceWith(userId, exercise.id);
  });

  it("Проверка выброса исключения, если упражнение не найдено", async () => {
    repository.getExerciseById.mockResolvedValue(null);

    await expect(useCase.execute(userId, exercise.id)).rejects.toThrow(HTTPException);
  });
});
