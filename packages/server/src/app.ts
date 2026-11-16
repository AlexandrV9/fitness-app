import { Hono } from "hono";

import { pool } from "./database/pool.js";
import { JwtAuthTokenManager } from "./modules/auth/infrastructure/JwtAuthTokenManager.js";
import { createAuthMiddleware } from "./modules/auth/presentation/createAuthMiddleware.js";
import { CreateExerciseUseCase } from "./modules/exercises/application/use-cases/createExercise/index.js";
import { DeleteExerciseUseCase } from "./modules/exercises/application/use-cases/deleteExercise/index.js";
import { GetExerciseByIdUseCase } from "./modules/exercises/application/use-cases/getExerciseById/index.js";
import { UpdateExerciseUseCase } from "./modules/exercises/application/use-cases/updateExercise/index.js";
import { ExercisesRepository } from "./modules/exercises/infrastructure/ExercisesRepository.js";
import { ExercisesController } from "./modules/exercises/presentation/ExercisesController.js";
import { errorHandler } from "./shared/lib/error-handler.js";

import type { AuthVariables } from "./modules/auth/presentation/createAuthMiddleware.js";

export const app = new Hono();
app.onError(errorHandler);
app.get("/", (c) => c.text("Hello Hono!"));

const authenticate = createAuthMiddleware(new JwtAuthTokenManager());

const exercises = new Hono<{ Variables: AuthVariables }>();
exercises.use("*", authenticate);
const exerciseRepository = new ExercisesRepository(pool);
new ExercisesController(
  new CreateExerciseUseCase(exerciseRepository),
  new GetExerciseByIdUseCase(exerciseRepository),
  new UpdateExerciseUseCase(exerciseRepository),
  new DeleteExerciseUseCase(exerciseRepository),
).register(exercises);
app.route("/exercises", exercises);
