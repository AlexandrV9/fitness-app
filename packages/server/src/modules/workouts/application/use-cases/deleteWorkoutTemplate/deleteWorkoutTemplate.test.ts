import { beforeEach, describe, expect, it } from "vitest";

import { createWorkoutTemplatesRepositoryMock, template, userId } from "../../../testing/index.js";
import { DeleteWorkoutTemplateUseCase } from "./index.js";

describe("DeleteWorkoutTemplateUseCase", () => {
  const repository = createWorkoutTemplatesRepositoryMock();
  const useCase = new DeleteWorkoutTemplateUseCase(repository);

  beforeEach(() => {
    repository.deleteWorkoutTemplate.mockReset();
  });

  it("удаляет шаблон, если репозиторий подтвердил удаление", async () => {
    repository.deleteWorkoutTemplate.mockResolvedValue(true);

    await expect(useCase.execute(userId, template.id)).resolves.toBeUndefined();
    expect(repository.deleteWorkoutTemplate).toHaveBeenCalledExactlyOnceWith({
      userId,
      templateId: template.id,
    });
  });

  it("бросает WORKOUT_TEMPLATE_NOT_FOUND при удалении несуществующего шаблона", async () => {
    repository.deleteWorkoutTemplate.mockResolvedValue(false);

    await expect(useCase.execute(userId, template.id)).rejects.toMatchObject({
      code: "WORKOUT_TEMPLATE_NOT_FOUND",
    });
  });
});
