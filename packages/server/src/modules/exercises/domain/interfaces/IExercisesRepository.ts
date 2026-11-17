import type { PaginationMeta } from "~/shared/lib/pagination.js";
import type { IExercise } from "./IExercise.js";

export type GetExercisesProps = {
  page?: number;
  size?: number;
  search?: string;
};

export type GetExercisesResult = {
  data: IExercise[];
  pagination: PaginationMeta;
};

export type CreateExerciseProps = {
  name: string;
  parameterSchema: unknown[];
};

export type UpdateExerciseProps = {
  id: string;
  name?: string;
  parameterSchema?: unknown[];
};

export interface IExercisesRepository {
  createExercise(userId: string, data: CreateExerciseProps): Promise<IExercise | null>;
  updateExercise(userId: string, data: UpdateExerciseProps): Promise<IExercise | null>;
  deleteExercise(userId: string, exerciseId: string): Promise<boolean>;
  getExercises(userId: string, data?: GetExercisesProps): Promise<GetExercisesResult>;
  getExerciseById(userId: string, exerciseId: string): Promise<IExercise | null>;
}
