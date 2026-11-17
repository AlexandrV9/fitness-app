import type { Pool } from "pg";

const TABLE_NAME = "workout_template_exercises";

/** Схема состава шаблона: какие упражнения и сколько подходов в нём запланировано. */
export class WorkoutTemplateExercisesRepository {
  constructor(private readonly pool: Pool) {}

  async createTable(): Promise<void> {
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS ${TABLE_NAME} (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        template_id UUID NOT NULL REFERENCES workout_templates(id) ON DELETE CASCADE,
        exercise_id UUID NOT NULL
          CONSTRAINT workout_template_exercises_exercise_fk
          REFERENCES exercises(id) ON DELETE RESTRICT,
        position INTEGER NOT NULL CHECK (position > 0),
        planned_sets INTEGER CHECK (planned_sets BETWEEN 1 AND 100),
        UNIQUE (template_id, position)
      )
    `);

    await this.pool.query(`
      CREATE INDEX IF NOT EXISTS workout_template_exercises_exercise_id_idx
        ON ${TABLE_NAME} (exercise_id)
    `);
  }
}
