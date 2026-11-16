import { beforeEach, describe, expect, it } from "vitest";

import {
  createWorkoutTemplatesRepositoryMock,
  template,
  templateInput,
  userId,
} from "../../../testing/index.js";
import { CreateWorkoutTemplateUseCase } from "./index.js";

describe("CreateWorkoutTemplateUseCase", () => {
  const repository = createWorkoutTemplatesRepositoryMock();
  const useCase = new CreateWorkoutTemplateUseCase(repository);

  beforeEach(() => {
    repository.createWorkoutTemplate.mockReset();
  });

  it("создаёт шаблон через репозиторий", async () => {
    repository.createWorkoutTemplate.mockResolvedValue(template);

    await expect(useCase.execute(userId, templateInput)).resolves.toEqual(template);
    expect(repository.createWorkoutTemplate).toHaveBeenCalledExactlyOnceWith({
      userId,
      ...templateInput,
    });
  });
});
