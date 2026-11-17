import { beforeEach, describe, expect, it } from "vitest";

import {
  ExerciseInvalidParameterSchemaException,
  ExerciseNotFoundException,
} from "../../../domain/exceptions/index.js";
import {
  createExercisesRepositoryMock,
  exercise,
  updateExerciseRequest,
  updatedExerciseName,
  userId,
} from "../../../testing/index.js";
import { UpdateExerciseUseCase } from "./index.js";

describe("UpdateExerciseUseCase", () => {
  const repository = createExercisesRepositoryMock();
  const useCase = new UpdateExerciseUseCase(repository);

  beforeEach(() => {
    repository.updateExercise.mockReset();
  });

  it("Проверка обновления названия упражнения", async () => {
    const request = { ...updateExerciseRequest, name: updatedExerciseName };
    const updatedExercise = { ...exercise, name: updatedExerciseName };

    repository.updateExercise.mockResolvedValue(updatedExercise);

    const result = await useCase.execute(userId, request);

    expect(result).toEqual(updatedExercise);
    expect(repository.updateExercise).toHaveBeenCalledExactlyOnceWith(userId, {
      ...request,
      parameterSchema: undefined,
    });
  });

  it("Проверка обновления упражнения при передаче пустого массива в parameterSchema", async () => {
    const request = { ...updateExerciseRequest, parameterSchema: [] };
    const updatedExercise = { ...exercise, parameterSchema: [] };

    repository.updateExercise.mockResolvedValue(updatedExercise);

    const result = await useCase.execute(userId, request);

    expect(result).toEqual(updatedExercise);
    expect(repository.updateExercise).toHaveBeenCalledExactlyOnceWith(userId, request);
  });

  it("Проверка выброса исключения при попытке обновления упражнения путём передачи parameterSchema = null", async () => {
    await expect(
      useCase.execute(userId, {
        ...updateExerciseRequest,
        parameterSchema: null,
      }),
    ).rejects.toThrow(ExerciseInvalidParameterSchemaException);

    expect(repository.updateExercise).not.toHaveBeenCalled();
  });

  it("Проверка выброса исключения, если упражнение не найдено", async () => {
    repository.updateExercise.mockResolvedValue(null);

    await expect(
      useCase.execute(userId, {
        ...updateExerciseRequest,
        name: updatedExerciseName,
      }),
    ).rejects.toThrow(ExerciseNotFoundException);
  });
});
