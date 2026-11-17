import type { PaginationParams } from "~/shared/lib/pagination.js";
import type { IWorkoutsRepository } from "../../../domain/repositories/IWorkoutsRepository.js";

export class GetWorkoutsUseCase {
  constructor(private readonly repository: IWorkoutsRepository) {}

  execute(userId: string, { page, size }: PaginationParams) {
    return this.repository.getWorkouts({ userId, page, size });
  }
}
