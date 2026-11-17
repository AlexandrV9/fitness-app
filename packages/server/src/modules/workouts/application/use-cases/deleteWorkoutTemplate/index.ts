import { WorkoutTemplateNotFoundException } from "../../../domain/exceptions/index.js";

import type { IWorkoutTemplatesRepository } from "../../../domain/repositories/IWorkoutTemplatesRepository.js";

export class DeleteWorkoutTemplateUseCase {
  constructor(private readonly repository: IWorkoutTemplatesRepository) {}

  async execute(userId: string, templateId: string) {
    const success = await this.repository.deleteWorkoutTemplate({ userId, templateId });

    if (!success) {
      throw new WorkoutTemplateNotFoundException();
    }
  }
}
