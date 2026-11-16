import { beforeEach, describe, expect, it } from "vitest";

import {
  createWorkoutTemplatesRepositoryMock,
  template,
  userId,
} from "../../../testing/index.js";
import { GetWorkoutTemplatesUseCase } from "./index.js";

describe("GetWorkoutTemplatesUseCase", () => {
  const repository = createWorkoutTemplatesRepositoryMock();
  const useCase = new GetWorkoutTemplatesUseCase(repository);

  beforeEach(() => {
    repository.getWorkoutTemplates.mockReset();
  });

  it("возвращает список шаблонов", async () => {
    const page = { page: 0, size: 20 };
    const result = {
      data: [template],
      pagination: {
        page: 0,
        limit: 20,
        totalCount: 1,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      },
    };
    repository.getWorkoutTemplates.mockResolvedValue(result);

    await expect(useCase.execute(userId, page)).resolves.toEqual(result);
    expect(repository.getWorkoutTemplates).toHaveBeenCalledExactlyOnceWith({
      userId,
      ...page,
    });
  });
});
