import type { WorkoutTemplateInputDto } from "../../../domain/interfaces/template/TemplateDto.js";
import type { IWorkoutTemplatesRepository } from "../../../domain/repositories/IWorkoutTemplatesRepository.js";

export class CreateWorkoutTemplateUseCase {
  constructor(private readonly repository: IWorkoutTemplatesRepository) {}

  execute(userId: string, input: WorkoutTemplateInputDto) {
    return this.repository.createWorkoutTemplate({ userId, ...input });
  }
}
