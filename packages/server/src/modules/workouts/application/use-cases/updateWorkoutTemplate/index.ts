import type { WorkoutTemplateInputDto } from "../../../domain/interfaces/template/TemplateDto.js";
import type { IWorkoutTemplatesRepository } from "../../../domain/repositories/IWorkoutTemplatesRepository.js";

export class UpdateWorkoutTemplateUseCase {
  constructor(private readonly repository: IWorkoutTemplatesRepository) {}

  execute(userId: string, templateId: string, input: Partial<WorkoutTemplateInputDto>) {
    return this.repository.updateWorkoutTemplate({ userId, templateId, ...input });
  }
}
