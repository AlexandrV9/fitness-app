import { beforeEach, describe, expect, it } from "vitest";

import { createExercisesRepositoryMock, exercise, userId } from "../../../testing/index.js";
import { GetExercisesUseCase } from "./index.js";

describe("GetExercisesUseCase", () => {
  const repository = createExercisesRepositoryMock();
  const useCase = new GetExercisesUseCase(repository);

  beforeEach(() => {
    repository.getExercises.mockReset();
  });

  it("Получение списка упражнений с фильтрами", async () => {
    const filters = { page: 0, size: 20, search: "bench" };
    const result = {
      data: [exercise],
      pagination: {
        page: 0,
        limit: 20,
        totalCount: 1,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      },
    };

    repository.getExercises.mockResolvedValue(result);

    await expect(useCase.execute(userId, filters)).resolves.toEqual(result);
    expect(repository.getExercises).toHaveBeenCalledExactlyOnceWith(userId, filters);
  });
});
