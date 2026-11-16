import { beforeEach, describe, expect, it } from "vitest";

import {
  createWorkoutTemplatesRepositoryMock,
  template,
  userId,
} from "../../../testing/index.js";
import { GetWorkoutTemplateUseCase } from "./index.js";

describe("GetWorkoutTemplateUseCase", () => {
  const repository = createWorkoutTemplatesRepositoryMock();
  const useCase = new GetWorkoutTemplateUseCase(repository);

  beforeEach(() => {
    repository.getWorkoutTemplate.mockReset();
  });

  it("возвращает шаблон по id", async () => {
    repository.getWorkoutTemplate.mockResolvedValue(template);

    await expect(useCase.execute(userId, template.id)).resolves.toEqual(template);
    expect(repository.getWorkoutTemplate).toHaveBeenCalledExactlyOnceWith({
      userId,
      templateId: template.id,
    });
  });

  it("бросает WORKOUT_TEMPLATE_NOT_FOUND, если шаблон не найден", async () => {
    repository.getWorkoutTemplate.mockResolvedValue(null);

    await expect(useCase.execute(userId, template.id)).rejects.toMatchObject({
      code: "WORKOUT_TEMPLATE_NOT_FOUND",
    });
  });
});
