import { withTransaction } from "~/database/withTransaction.js";
import { buildPaginationMeta } from "~/shared/lib/pagination.js";

import {
  ActiveWorkoutExistsException,
  UserNotFoundException,
  WorkoutNotFoundException,
  WorkoutSetNotFoundException,
  WorkoutTemplateNotFoundException,
} from "../domain/exceptions/index.js";

import type { Pool, PoolClient } from "pg";

import type { SetDto, SetResult } from "../domain/interfaces/set/SetDto.js";
import type { WorkoutDetailDto } from "../domain/interfaces/workout/WorkoutDetailDto.js";
import type { WorkoutDto } from "../domain/interfaces/workout/WorkoutDto.js";
import type {
  ChangeWorkoutProps,
  GetActiveWorkoutProps,
  GetWorkoutByIdProps,
  GetWorkoutsProps,
  IWorkoutsRepository,
  StartWorkoutProps,
} from "../domain/repositories/IWorkoutsRepository.js";

const TABLE_NAME = "workouts";

/** Тренировка */
const workoutColumns = `
  id,
  user_id AS "userId",
  template_id AS "templateId",
  template_name AS "templateName",
  started_at AS "startedAt",
  finished_at AS "finishedAt"
`;

/** Данные одного подхода (включая id упражнения для группировки) */
const setColumns = `
  id,
  workout_exercise_id AS "workoutExerciseId",
  set_number AS "setNumber",
  status,
  parameter_values AS "parameterValues"
`;

type WorkoutSetRow = SetDto & { workoutExerciseId: string };

/** Хранит тренировки пользователя: старт, история, завершение и изменение подходов. */
export class WorkoutsRepository implements IWorkoutsRepository {
  constructor(private readonly pool: Pool) {}

  async createTable(): Promise<void> {
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS ${TABLE_NAME} (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id),
        template_id UUID REFERENCES workout_templates(id) ON DELETE SET NULL,
        template_name TEXT NOT NULL,
        started_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
        finished_at TIMESTAMPTZ
      )
    `);

    await this.pool.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS workouts_active_user_id_idx
        ON ${TABLE_NAME} (user_id) WHERE finished_at IS NULL
    `);

    await this.pool.query(`
      CREATE INDEX IF NOT EXISTS workouts_user_history_idx
        ON ${TABLE_NAME} (user_id, started_at DESC, id DESC)
    `);

    await this.pool.query(`
      CREATE INDEX IF NOT EXISTS workouts_template_id_idx
        ON ${TABLE_NAME} (template_id)
    `);
  }

  /**
   * Получаем список завершенных тренировок пользователя
   */
  async getWorkouts({ userId, page, size }: GetWorkoutsProps) {
    const {
      rows: [total],
    } = await this.pool.query<{ count: string }>(
      `
        SELECT COUNT(*) AS count 
        FROM ${TABLE_NAME} 
        WHERE user_id = $1 AND finished_at IS NOT NULL`,
      [userId],
    );

    const offset = page * size;

    const { rows } = await this.pool.query<WorkoutDto>(
      `
        SELECT ${workoutColumns}
        FROM ${TABLE_NAME}
        WHERE user_id = $1 AND finished_at IS NOT NULL
        ORDER BY started_at DESC, id DESC
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

  /**
   * Получение детальной информации по тренировки (с упражнениями и подходами)
   */
  async getWorkoutById(
    { userId, workoutId }: GetWorkoutByIdProps,
    connection: Pool | PoolClient = this.pool,
  ) {
    const {
      rows: [workout],
    } = await connection.query<WorkoutDetailDto>(
      `
        WITH
          workout AS (
            SELECT ${workoutColumns}
            FROM ${TABLE_NAME}
            WHERE user_id = $1 AND id = $2
          ),
          workout_exercises_json AS (
            SELECT
              e.workout_id,
              jsonb_agg(
                jsonb_build_object(
                  'id', e.id,
                  'exerciseId', e.exercise_id,
                  'name', e.exercise_name,
                  'position', e.position,
                  'isSkipped', e.is_skipped,
                  'parameterSchema', e.parameter_schema,
                  'sets', COALESCE(s.sets, '[]'::jsonb)
                )
                ORDER BY e.position
              ) AS exercises
            FROM workout_exercises AS e
            LEFT JOIN LATERAL (
              SELECT jsonb_agg(
                jsonb_build_object(
                  'id', ws.id,
                  'setNumber', ws.set_number,
                  'status', ws.status,
                  'parameterValues', ws.parameter_values
                )
                ORDER BY ws.set_number
              ) AS sets
              FROM workout_sets AS ws
              WHERE ws.workout_exercise_id = e.id
            ) s ON true
            WHERE e.workout_id = $2
            GROUP BY e.workout_id
          )
        SELECT w.*, COALESCE(x.exercises, '[]'::jsonb) AS exercises
        FROM workout AS w
        LEFT JOIN workout_exercises_json x ON x.workout_id = w.id;
      `,
      [userId, workoutId],
    );

    return workout ?? null;
  }

  /**
   * Получение детальной информации по активной тренировки (с упражнениями и подходами)
   */
  async getActiveWorkout({ userId }: GetActiveWorkoutProps) {
    const {
      rows: [active],
    } = await this.pool.query<{ id: string }>(
      `
        SELECT id
        FROM ${TABLE_NAME}
        WHERE user_id = $1 AND finished_at IS NULL
      `,
      [userId],
    );

    if (!active) return null;

    return this.getWorkoutById({ userId, workoutId: active.id });
  }

  /**
   * Запускает тренировку по шаблону
   */
  async startWorkout({ userId, templateId }: StartWorkoutProps) {
    return withTransaction(this.pool, async (client) => {
      // Ставим блок на строку, где id = userId в таблице users
      // (Другой параллельный start для того же userId будет ждать)
      const owner = await client.query(
        `
          SELECT id 
          FROM users 
          WHERE id = $1 
          FOR NO KEY UPDATE
        `,
        [userId],
      );

      if (!owner.rowCount) {
        throw new UserNotFoundException();
      }

      // Пытаемся найти активную тренировку пользователя
      const {
        rows: [activeWorkout],
      } = await client.query<{ id: string; templateId: string | null }>(
        `
          SELECT 
            id, 
            template_id AS "templateId" 
          FROM workouts 
          WHERE user_id = $1 AND finished_at IS NULL 
          FOR UPDATE`,
        [userId],
      );

      if (activeWorkout) {
        // Нельзя начать новую тренировку, пока не завершена текущая с другим шаблоном
        if (activeWorkout.templateId !== templateId) {
          throw new ActiveWorkoutExistsException();
        }

        // Если шаблон такой же, то возвращаем просто эту тренировку
        const workout = await this.getWorkoutById({ userId, workoutId: activeWorkout.id }, client);
        if (!workout) throw new WorkoutNotFoundException();

        return {
          workout,
          created: false,
        };
      }

      // Если нет запущенной тренировки, то пытаемся найти шаблон тренировки
      const {
        rows: [workoutTemplate],
      } = await client.query<{ name: string }>(
        `
          SELECT name 
          FROM workout_templates 
          WHERE user_id = $1 AND id = $2 FOR SHARE
        `,
        [userId, templateId],
      );

      if (!workoutTemplate) {
        throw new WorkoutTemplateNotFoundException();
      }

      // Создаем новую тренировку
      const {
        rows: [newWorkout],
      } = await client.query<{ id: string }>(
        `
          INSERT INTO workouts (user_id, template_id, template_name) 
          VALUES ($1, $2, $3) 
          RETURNING id
        `,
        [userId, templateId, workoutTemplate.name],
      );

      // Из шаблона создаем упражнения тренировки и запланированные пустые подходы.
      await client.query(
        `
          WITH inserted_exercises AS (
            INSERT INTO workout_exercises (
              workout_id,
              exercise_id,
              exercise_name,
              position,
              parameter_schema
            )
            SELECT
              $2,
              item.exercise_id,
              exercise.name,
              item.position,
              exercise.parameter_schema
            FROM workout_template_exercises item
            JOIN exercises exercise
              ON exercise.id = item.exercise_id
              AND exercise.user_id = $3
            WHERE item.template_id = $1
            RETURNING id, position
          )
          INSERT INTO workout_sets (workout_exercise_id, set_number)
          SELECT inserted_exercises.id, gs.number
          FROM inserted_exercises
          JOIN workout_template_exercises item
            ON item.template_id = $1
            AND item.position = inserted_exercises.position
          CROSS JOIN LATERAL generate_series(1, item.planned_sets) AS gs(number)
        `,
        [templateId, newWorkout.id, userId],
      );

      const workout = await this.getWorkoutById({ userId, workoutId: newWorkout.id }, client);
      if (!workout) throw new WorkoutNotFoundException();

      return {
        workout,
        created: true,
      };
    });
  }

  /**
   * Обновление тренировки
   */
  async changeWorkout<T>({ userId, id, operation }: ChangeWorkoutProps<T>) {
    return withTransaction(this.pool, async (client) => {
      // Находим тренировку
      const { rowCount } = await client.query(
        `
          SELECT id 
          FROM workouts 
          WHERE user_id = $1 AND id = $2 
          FOR UPDATE
        `,
        [userId, id],
      );

      if (!rowCount) {
        return null;
      }

      const workout = await this.getWorkoutById({ userId, workoutId: id }, client);

      if (!workout) {
        throw new WorkoutNotFoundException();
      }

      return operation(workout, {
        finish: async () => {
          await client.query(
            `
              UPDATE workout_sets 
              SET status = 'skipped'
              WHERE status = 'pending' AND workout_exercise_id IN (
                SELECT id FROM workout_exercises WHERE workout_id = $1
              )
            `,
            [id],
          );
          await client.query("UPDATE workouts SET finished_at = clock_timestamp() WHERE id = $1", [
            id,
          ]);
          const finished = await this.getWorkoutById({ userId, workoutId: id }, client);
          if (!finished) throw new WorkoutNotFoundException();
          return finished;
        },
        skipExercise: async (exerciseId) => {
          await client.query(
            `
              UPDATE workout_exercises 
              SET is_skipped = true 
              WHERE id = $1
            `,
            [exerciseId],
          );

          await client.query(
            `
              UPDATE workout_sets 
              SET status = 'skipped' 
              WHERE workout_exercise_id = $1 AND status = 'pending'
            `,
            [exerciseId],
          );

          const skipped = await this.getWorkoutById({ userId, workoutId: id }, client);
          if (!skipped) throw new WorkoutNotFoundException();
          return skipped;
        },
        createSet: (exerciseId) => this.createSet(client, exerciseId),
        updateSet: (setId, result) => this.updateSet(client, setId, result),
        deleteSet: (exerciseId, setId) => this.deleteSet(client, exerciseId, setId),
      });
    });
  }

  private async deleteSet(client: PoolClient, exerciseId: string, setId: string): Promise<void> {
    const { rowCount } = await client.query(
      "DELETE FROM workout_sets WHERE id = $1 AND workout_exercise_id = $2",
      [setId, exerciseId],
    );
    if (!rowCount) throw new WorkoutSetNotFoundException();

    // Сдвиг освобождает номера перед перенумерацией с UNIQUE-ограничением.
    // changeWorkout удерживает блокировку тренировки до завершения транзакции.
    await client.query(
      `UPDATE workout_sets
       SET set_number = set_number + (
         SELECT COALESCE(MAX(set_number), 0)
         FROM workout_sets WHERE workout_exercise_id = $1
       )
       WHERE workout_exercise_id = $1`,
      [exerciseId],
    );
    await client.query(
      `WITH numbered AS (
         SELECT id, ROW_NUMBER() OVER (ORDER BY set_number)::integer AS number
         FROM workout_sets WHERE workout_exercise_id = $1
       )
       UPDATE workout_sets AS target
       SET set_number = numbered.number
       FROM numbered WHERE target.id = numbered.id`,
      [exerciseId],
    );
  }

  /**
   * Добавление подхода
   */
  private async createSet(client: PoolClient, exerciseId: string): Promise<SetDto> {
    const {
      rows: [workoutSet],
    } = await client.query<WorkoutSetRow>(
      `
        INSERT INTO workout_sets (workout_exercise_id, set_number)
        SELECT $1, COALESCE(MAX(set_number), 0) + 1
        FROM workout_sets
        WHERE workout_exercise_id = $1
        RETURNING ${setColumns}
      `,
      [exerciseId],
    );

    return workoutSet;
  }

  /**
   * Обновление подхода
   */
  private async updateSet(client: PoolClient, setId: string, result: SetResult): Promise<SetDto> {
    const {
      rows: [workoutSet],
    } = await client.query<WorkoutSetRow>(
      `
        UPDATE workout_sets
        SET status = $2, parameter_values = $3::jsonb
        WHERE id = $1
        RETURNING ${setColumns}
      `,
      [setId, result.status, JSON.stringify(result.parameterValues)],
    );

    return workoutSet;
  }
}
