import { beforeEach, describe, expect, it } from "vitest";

import { createWorkoutsRepositoryMock, userId, workout } from "../../../testing/index.js";
import { GetWorkoutsUseCase } from "./index.js";

describe("GetWorkoutsUseCase", () => {
  const { repository } = createWorkoutsRepositoryMock();
  const useCase = new GetWorkoutsUseCase(repository);

  beforeEach(() => {
    repository.getWorkouts.mockReset();
  });

  it("возвращает список тренировок пользователя", async () => {
    const page = { page: 0, size: 20 };
    const result = {
      data: [workout],
      pagination: {
        page: 0,
        limit: 20,
        totalCount: 1,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      },
    };
    repository.getWorkouts.mockResolvedValue(result);

    await expect(useCase.execute(userId, page)).resolves.toEqual(result);
    expect(repository.getWorkouts).toHaveBeenCalledExactlyOnceWith({
      userId,
      ...page,
    });
  });
});
