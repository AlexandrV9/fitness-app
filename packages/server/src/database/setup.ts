import { RefreshSessionsRepository } from "../modules/auth/infrastructure/RefreshSessionsRepository.js";
import { ExercisesRepository } from "../modules/exercises/infrastructure/ExercisesRepository.js";
import { UsersRepository } from "../modules/users/infrastructure/UsersRepository.js";
import { WorkoutExercisesRepository } from "../modules/workouts/infrastructure/WorkoutExercisesRepository.js";
import { WorkoutSetsRepository } from "../modules/workouts/infrastructure/WorkoutSetsRepository.js";
import { WorkoutsRepository } from "../modules/workouts/infrastructure/WorkoutsRepository.js";
import { WorkoutTemplateExercisesRepository } from "../modules/workouts/infrastructure/WorkoutTemplateExercisesRepository.js";
import { WorkoutTemplatesRepository } from "../modules/workouts/infrastructure/WorkoutTemplatesRepository.js";
import { checkDatabaseConnection, pool } from "./pool.js";

async function setup(): Promise<void> {
  await checkDatabaseConnection();

  try {
    await new UsersRepository(pool).createTable();
    await new RefreshSessionsRepository(pool).createTable();
    await new ExercisesRepository(pool).createTable();
    await new WorkoutTemplatesRepository(pool).createTable();
    await new WorkoutTemplateExercisesRepository(pool).createTable();
    await new WorkoutsRepository(pool).createTable();
    await new WorkoutExercisesRepository(pool).createTable();
    await new WorkoutSetsRepository(pool).createTable();

    console.log("Database tables are ready");
  } finally {
    await pool.end();
  }
}

try {
  await setup();
} catch (error) {
  console.error("Database setup failed:", error);
  process.exit(1);
}
