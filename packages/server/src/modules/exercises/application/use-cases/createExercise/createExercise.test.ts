import { HTTPException } from "hono/http-exception";
import { beforeEach, describe, expect, it } from "vitest";

import { ExerciseCreateFailedException } from "../../../domain/exceptions/index.js";
import {
  createExerciseRequest,
  createExercisesRepositoryMock,
  exercise,
  userId,
} from "../../../testing/index.js";
import { CreateExerciseUseCase } from "./index.js";

describe("CreateExerciseUseCase", () => {
  const repository = createExercisesRepositoryMock();
  const useCase = new CreateExerciseUseCase(repository);

  beforeEach(() => {
    repository.createExercise.mockReset();
  });

  it("Создание упражнения", async () => {
    repository.createExercise.mockResolvedValue(exercise);

    const createdExercise = await useCase.execute(userId, createExerciseRequest);

    expect(createdExercise).toEqual(exercise);
    expect(repository.createExercise).toHaveBeenCalledExactlyOnceWith(
      userId,
      createExerciseRequest,
    );
  });

  it("Проверка выброса исключения, если parameterSchema — не массив", async () => {
    await expect(
      useCase.execute(userId, {
        ...createExerciseRequest,
        parameterSchema: {},
      }),
    ).rejects.toThrow(HTTPException);

    expect(repository.createExercise).not.toHaveBeenCalled();
  });

  it("Проверка выброса исключения, если репозиторий не вернул упражнение", async () => {
    repository.createExercise.mockResolvedValue(null);

    await expect(useCase.execute(userId, createExerciseRequest)).rejects.toThrow(
      ExerciseCreateFailedException,
    );
  });
});
