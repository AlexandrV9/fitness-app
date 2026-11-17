import type { PaginatedResult } from "~/shared/lib/pagination.js";

import type { WorkoutTemplateDetailDto } from "../interfaces/template/TemplateDetailDto.js";
import type {
  WorkoutTemplateDto,
  WorkoutTemplateInputDto,
} from "../interfaces/template/TemplateDto.js";

export type GetWorkoutTemplatesProps = {
  userId: string;
  page: number;
  size: number;
};

export type GetWorkoutTemplateProps = {
  userId: string;
  templateId: string;
};

export type CreateWorkoutTemplateProps = {
  userId: string;
} & WorkoutTemplateInputDto;

export type UpdateWorkoutTemplateProps = {
  userId: string;
  templateId: string;
} & Partial<WorkoutTemplateInputDto>;

export type DeleteWorkoutTemplateProps = {
  userId: string;
  templateId: string;
};

export interface IWorkoutTemplatesRepository {
  getWorkoutTemplates(data: GetWorkoutTemplatesProps): Promise<PaginatedResult<WorkoutTemplateDto>>;
  getWorkoutTemplate(data: GetWorkoutTemplateProps): Promise<WorkoutTemplateDetailDto | null>;
  createWorkoutTemplate(data: CreateWorkoutTemplateProps): Promise<WorkoutTemplateDetailDto>;
  updateWorkoutTemplate(data: UpdateWorkoutTemplateProps): Promise<WorkoutTemplateDetailDto>;
  deleteWorkoutTemplate(data: DeleteWorkoutTemplateProps): Promise<boolean>;
}
