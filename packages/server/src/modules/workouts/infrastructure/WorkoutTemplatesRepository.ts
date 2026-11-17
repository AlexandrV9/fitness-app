import { withTransaction } from "~/database/withTransaction.js";
import { buildPaginationMeta } from "~/shared/lib/pagination.js";

import {
  WorkoutTemplateExerciseNotFoundException,
  WorkoutTemplateNotFoundException,
} from "../domain/exceptions/index.js";

import type { Pool, PoolClient } from "pg";

import type { WorkoutTemplateDetailDto } from "../domain/interfaces/template/TemplateDetailDto.js";
import type { WorkoutTemplateDto } from "../domain/interfaces/template/TemplateDto.js";
import type { TemplateExerciseInputDto } from "../domain/interfaces/template/TemplateExerciseDto.js";
import type {
  CreateWorkoutTemplateProps,
  DeleteWorkoutTemplateProps,
  GetWorkoutTemplateProps,
  GetWorkoutTemplatesProps,
  IWorkoutTemplatesRepository,
  UpdateWorkoutTemplateProps,
} from "../domain/repositories/IWorkoutTemplatesRepository.js";

const TABLE_NAME = "workout_templates";
const templateSummary = 'id, user_id AS "userId", name';

/** Хранит шаблоны тренировок пользователя: создание, список, обновление и удаление. */
export class WorkoutTemplatesRepository implements IWorkoutTemplatesRepository {
  constructor(private readonly pool: Pool) {}

  async createTable(): Promise<void> {
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS ${TABLE_NAME} (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id),
        name TEXT NOT NULL
      )
    `);

    await this.pool.query(`
      CREATE INDEX IF NOT EXISTS workout_templates_user_id_idx
        ON ${TABLE_NAME} (user_id, id)
    `);
  }

  async getWorkoutTemplates({ userId, page, size }: GetWorkoutTemplatesProps) {
    const {
      rows: [total],
    } = await this.pool.query<{ count: string }>(
      `
        SELECT COUNT(*) AS count 
        FROM workout_templates 
        WHERE user_id = $1
      `,
      [userId],
    );

    const offset = page * size;

    const { rows } = await this.pool.query<WorkoutTemplateDto>(
      `
        SELECT ${templateSummary} FROM ${TABLE_NAME}
        WHERE user_id = $1 
        ORDER BY name, id 
        LIMIT $2 
        OFFSET $3
      `,
      [userId, size, offset],
    );

    return {
      data: rows,
      pagination: buildPaginationMeta(page, size, Number(total.count)),
    };
  }

  async getWorkoutTemplate(
    { userId, templateId }: GetWorkoutTemplateProps,
    connection: Pool | PoolClient = this.pool,
  ) {
    const {
      rows: [template],
    } = await connection.query<WorkoutTemplateDetailDto>(
      `
        SELECT
          t.id,
          t.user_id AS "userId",
          t.name,
          COALESCE(e.exercises, '[]'::jsonb) AS exercises
        FROM ${TABLE_NAME} AS t
        LEFT JOIN LATERAL (
          SELECT jsonb_agg(
            jsonb_build_object(
              'id', item.id,
              'exerciseId', item.exercise_id,
              'name', exercise.name,
              'position', item.position,
              'plannedSets', item.planned_sets
            )
            ORDER BY item.position
          ) AS exercises
          FROM workout_template_exercises AS item
          JOIN exercises AS exercise
            ON exercise.id = item.exercise_id
            AND (exercise.user_id = t.user_id OR exercise.user_id IS NULL)
          WHERE item.template_id = t.id
        ) AS e ON true
        WHERE t.user_id = $1 AND t.id = $2
      `,
      [userId, templateId],
    );

    return template ?? null;
  }

  createWorkoutTemplate({ userId, name, exercises }: CreateWorkoutTemplateProps) {
    return withTransaction(this.pool, async (client) => {
      if (!(await this.ownsExercises(client, userId, exercises))) {
        throw new WorkoutTemplateExerciseNotFoundException();
      }

      const {
        rows: [template],
      } = await client.query<{ id: string }>(
        `
          INSERT INTO workout_templates (user_id, name) 
          VALUES ($1, $2) 
          RETURNING id
        `,
        [userId, name],
      );

      await this.insertExercises(client, template.id, exercises);

      const created = await this.getWorkoutTemplate({ userId, templateId: template.id }, client);

      if (!created) {
        throw new WorkoutTemplateNotFoundException();
      }

      return created;
    });
  }

  updateWorkoutTemplate({ userId, templateId, name, exercises }: UpdateWorkoutTemplateProps) {
    return withTransaction(this.pool, async (client) => {
      const { rowCount } = await client.query(
        `
          SELECT id
          FROM workout_templates 
          WHERE user_id = $1 AND id = $2 
          FOR UPDATE
        `,
        [userId, templateId],
      );

      if (!rowCount) {
        throw new WorkoutTemplateNotFoundException();
      }

      if (exercises && !(await this.ownsExercises(client, userId, exercises))) {
        throw new WorkoutTemplateExerciseNotFoundException();
      }

      if (name !== undefined) {
        await client.query(
          `
            UPDATE workout_templates 
            SET name = $2 
            WHERE id = $1
          `,
          [templateId, name],
        );
      }

      if (exercises) {
        await client.query(
          `
            DELETE FROM workout_template_exercises 
            WHERE template_id = $1
          `,
          [templateId],
        );
        await this.insertExercises(client, templateId, exercises);
      }

      const updated = await this.getWorkoutTemplate({ userId, templateId }, client);

      if (!updated) {
        throw new WorkoutTemplateNotFoundException();
      }

      return updated;
    });
  }

  async deleteWorkoutTemplate({ userId, templateId }: DeleteWorkoutTemplateProps) {
    const { rowCount } = await this.pool.query(
      `
        DELETE FROM workout_templates 
        WHERE user_id = $1 AND id = $2
      `,
      [userId, templateId],
    );
    return Boolean(rowCount);
  }

  /**
   * Проверят, что все упражнения принадлежат пользователю
   * Если хотя бы одно не принадлежит, то вернет false
   */
  private async ownsExercises(
    client: PoolClient,
    userId: string,
    exercises: TemplateExerciseInputDto[],
  ) {
    const ids = [...new Set(exercises.map((exercise) => exercise.exerciseId))];
    const { rowCount } = await client.query(
      `
        SELECT id 
        FROM exercises 
        WHERE user_id = $1 AND id = ANY($2::uuid[]) 
        ORDER BY id 
        FOR KEY SHARE
      `,
      [userId, ids],
    );
    return ids.length === rowCount;
  }

  /**
   * Добавляет упражнения шаблона
   */
  private async insertExercises(
    client: PoolClient,
    templateId: string,
    exercises: TemplateExerciseInputDto[],
  ) {
    await client.query(
      `
        INSERT INTO workout_template_exercises (template_id, exercise_id, planned_sets, position)
        SELECT $1, item.exercise_id, item.planned_sets, item.position
        FROM unnest($2::uuid[], $3::integer[]) 
        WITH ORDINALITY AS item(exercise_id, planned_sets, position)
      `,
      [
        templateId,
        exercises.map((exercise) => exercise.exerciseId),
        exercises.map((exercise) => exercise.plannedSets),
      ],
    );
  }
}
