import type { Pool } from "pg";

const TABLE_NAME = "workout_sets";

/** Схема подходов внутри упражнения тренировки (`workout_sets`). */
export class WorkoutSetsRepository {
  constructor(private readonly pool: Pool) {}

  async createTable(): Promise<void> {
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS ${TABLE_NAME} (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        workout_exercise_id UUID NOT NULL
          REFERENCES workout_exercises(id) ON DELETE CASCADE,
        set_number INTEGER NOT NULL CHECK (set_number > 0),
        status TEXT NOT NULL DEFAULT 'pending'
          CHECK (status IN ('pending', 'completed', 'skipped')),
        parameter_values JSONB NOT NULL DEFAULT '{}'::jsonb
          CHECK (jsonb_typeof(parameter_values) = 'object'),
        CHECK (status = 'completed' OR parameter_values = '{}'::jsonb),
        UNIQUE (workout_exercise_id, set_number)
      )
    `);
  }
}
