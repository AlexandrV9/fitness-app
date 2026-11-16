import { ExercisesRepository } from '../modules/exercises/infrastructure/ExercisesRepository.js'
import { WorkoutExercisesRepository } from '../modules/workouts/infrastructure/WorkoutExercisesRepository.js'
import { WorkoutSetsRepository } from '../modules/workouts/infrastructure/WorkoutSetsRepository.js'
import { WorkoutTemplateExercisesRepository } from '../modules/workouts/infrastructure/WorkoutTemplateExercisesRepository.js'
import { WorkoutTemplatesRepository } from '../modules/workouts/infrastructure/WorkoutTemplatesRepository.js'
import { WorkoutsRepository } from '../modules/workouts/infrastructure/WorkoutsRepository.js'
import { checkDatabaseConnection, pool } from './pool.js'

await checkDatabaseConnection()

try {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL
    )
  `)

  await new ExercisesRepository(pool).createTable()
  await new WorkoutTemplatesRepository(pool).createTable()
  await new WorkoutTemplateExercisesRepository(pool).createTable()
  await new WorkoutsRepository(pool).createTable()
  await new WorkoutExercisesRepository(pool).createTable()
  await new WorkoutSetsRepository(pool).createTable()

  console.log('Database tables are ready')
} finally {
  await pool.end()
}
