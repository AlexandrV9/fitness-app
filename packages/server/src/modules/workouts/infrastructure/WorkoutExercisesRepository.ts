import type { Pool } from "pg";

const TABLE_NAME = "workout_exercises";

/** Схема упражнений внутри конкретной тренировки (`workout_exercises`). */
export class WorkoutExercisesRepository {
  constructor(private readonly pool: Pool) {}

  async createTable(): Promise<void> {
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS ${TABLE_NAME} (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        workout_id UUID NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
        exercise_id UUID REFERENCES exercises(id) ON DELETE SET NULL,
        exercise_name TEXT NOT NULL,
        position INTEGER NOT NULL CHECK (position > 0),
        is_skipped BOOLEAN NOT NULL DEFAULT false,
        parameter_schema JSONB NOT NULL
          CHECK (jsonb_typeof(parameter_schema) = 'array'),
        UNIQUE (workout_id, position)
      )
    `);

    await this.pool.query(`
      CREATE INDEX IF NOT EXISTS workout_exercises_exercise_id_idx
        ON ${TABLE_NAME} (exercise_id)
    `);
  }
}
