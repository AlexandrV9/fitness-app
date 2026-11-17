import { beforeEach, describe, expect, it } from "vitest";

import { createWorkoutTemplatesRepositoryMock, template, userId } from "../../../testing/index.js";
import { UpdateWorkoutTemplateUseCase } from "./index.js";

describe("UpdateWorkoutTemplateUseCase", () => {
  const repository = createWorkoutTemplatesRepositoryMock();
  const useCase = new UpdateWorkoutTemplateUseCase(repository);

  beforeEach(() => {
    repository.updateWorkoutTemplate.mockReset();
  });

  it("обновляет шаблон через репозиторий", async () => {
    const updated = { ...template, name: "Push day" };
    repository.updateWorkoutTemplate.mockResolvedValue(updated);

    await expect(useCase.execute(userId, template.id, { name: "Push day" })).resolves.toEqual(
      updated,
    );
    expect(repository.updateWorkoutTemplate).toHaveBeenCalledExactlyOnceWith({
      userId,
      templateId: template.id,
      name: "Push day",
    });
  });
});
