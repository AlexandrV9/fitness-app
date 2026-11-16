import type { PaginationParams } from "../../../../../shared/lib/pagination.js";
import type { IWorkoutTemplatesRepository } from "../../../domain/repositories/IWorkoutTemplatesRepository.js";

export class GetWorkoutTemplatesUseCase {
  constructor(private readonly repository: IWorkoutTemplatesRepository) {}

  execute(userId: string, { page, size }: PaginationParams) {
    return this.repository.getWorkoutTemplates({ userId, page, size });
  }
}
