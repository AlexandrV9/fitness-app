
import type { IWorkoutTemplatesRepository } from "../../../domain/repositories/IWorkoutTemplatesRepository.js";
import { WorkoutTemplateNotFoundException } from "../../../domain/exceptions/index.js";


export class GetWorkoutTemplateUseCase {
  constructor(private readonly repository: IWorkoutTemplatesRepository) {}

  async execute(userId: string, templateId: string) {
    const template = await this.repository.getWorkoutTemplate({ userId, templateId });

    if (!template) {
      throw new WorkoutTemplateNotFoundException();
    }

    return template;
  }
}
