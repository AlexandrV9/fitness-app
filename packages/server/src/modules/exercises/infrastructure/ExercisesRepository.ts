import { buildPaginationMeta } from "~/shared/lib/pagination.js";

import type { Pool } from "pg";

import type { IExercise } from "../domain/interfaces/IExercise.js";
import type {
  CreateExerciseProps,
  GetExercisesProps,
  IExercisesRepository,
  UpdateExerciseProps,
} from "../domain/interfaces/IExercisesRepository.js";

type ExerciseRow = {
  id: string;
  user_id: string;
  name: string;
  parameter_schema: IExercise["parameterSchema"];
};

const TABLE_NAME = "exercises";

/** Хранит упражнения пользователя: создание, чтение, обновление и удаление. */
export class ExercisesRepository implements IExercisesRepository {
  private readonly pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  async createTable(): Promise<void> {
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS ${TABLE_NAME} (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id),
        name TEXT NOT NULL,
        parameter_schema JSONB NOT NULL
          CHECK (jsonb_typeof(parameter_schema) = 'array')
      )
    `);

    await this.pool.query(`
      CREATE INDEX IF NOT EXISTS exercises_user_id_idx
        ON exercises (user_id)
    `);
  }

  async createExercise(userId: string, { name, parameterSchema }: CreateExerciseProps) {
    const {
      rows: [row],
    } = await this.pool.query<ExerciseRow>(
      `
        INSERT INTO ${TABLE_NAME} (user_id, name, parameter_schema)
        VALUES ($1, $2, $3::jsonb)
        RETURNING id, user_id, name, parameter_schema
      `,
      [userId, name, JSON.stringify(parameterSchema)],
    );

    return row ? this.toEntity(row) : null;
  }

  async updateExercise(userId: string, { id, name, parameterSchema }: UpdateExerciseProps) {
    const {
      rows: [row],
    } = await this.pool.query<ExerciseRow>(
      `
        UPDATE ${TABLE_NAME}
        SET
          name = COALESCE($3, name),
          parameter_schema = COALESCE($4::jsonb, parameter_schema)
        WHERE id = $1 AND user_id = $2
        RETURNING id, user_id, name, parameter_schema
      `,
      [
        id,
        userId,
        name ?? null,
        parameterSchema === undefined ? null : JSON.stringify(parameterSchema),
      ],
    );

    return row ? this.toEntity(row) : null;
  }

  async getExerciseById(userId: string, exerciseId: string) {
    const {
      rows: [row],
    } = await this.pool.query<ExerciseRow>(
      `
        SELECT id, user_id, name, parameter_schema
        FROM ${TABLE_NAME}
        WHERE id = $1 AND user_id = $2
      `,
      [exerciseId, userId],
    );

    return row ? this.toEntity(row) : null;
  }

  async deleteExercise(userId: string, exerciseId: string) {
    const result = await this.pool.query(
      `
        DELETE FROM ${TABLE_NAME}
        WHERE id = $1 AND user_id = $2
      `,
      [exerciseId, userId],
    );

    return (result.rowCount ?? 0) > 0;
  }

  async getExercises(userId: string, { page = 0, size = 20, search = "" }: GetExercisesProps = {}) {
    const offset = page * size;
    const filter = "user_id = $1 AND ($2 = '' OR strpos(lower(name), lower($2)) > 0)";
    const filterParams = [userId, search];

    const {
      rows: [total],
    } = await this.pool.query<{ count: string }>(
      `
        SELECT COUNT(*) AS count
        FROM ${TABLE_NAME}
        WHERE ${filter}
      `,
      filterParams,
    );

    const { rows } = await this.pool.query<ExerciseRow>(
      `
        SELECT id, user_id, name, parameter_schema
        FROM ${TABLE_NAME}
        WHERE ${filter}
        ORDER BY id
        LIMIT $3
        OFFSET $4
      `,
      [...filterParams, size, offset],
    );

    return {
      data: rows.map((row) => this.toEntity(row)),
      pagination: buildPaginationMeta(page, size, Number(total?.count ?? 0)),
    };
  }

  private toEntity(row: ExerciseRow): IExercise {
    return {
      id: row.id,
      name: row.name,
      userId: row.user_id,
      parameterSchema: row.parameter_schema,
    };
  }
}
