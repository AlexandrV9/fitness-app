import { Hono } from "hono";

import { pool } from "../../../database/pool.js";
import { authenticate } from "../../auth/presentation/authenticate.js";
import { CreateExerciseUseCase } from "../application/use-cases/createExercise/index.js";
import { DeleteExerciseUseCase } from "../application/use-cases/deleteExercise/index.js";
import { GetExerciseByIdUseCase } from "../application/use-cases/getExerciseById/index.js";
import { GetExercisesUseCase } from "../application/use-cases/getExercises/index.js";
import { UpdateExerciseUseCase } from "../application/use-cases/updateExercise/index.js";
import { ExercisesRepository } from "../infrastructure/ExercisesRepository.js";
import { ExercisesController } from "./ExercisesController.js";

import type { AuthVariables } from "../../auth/presentation/createAuthMiddleware.js";

export function createExercisesRouter() {
  const router = new Hono<{ Variables: AuthVariables }>();
  router.use("*", authenticate);

  const repository = new ExercisesRepository(pool);

  new ExercisesController(
    new GetExercisesUseCase(repository),
    new CreateExerciseUseCase(repository),
    new GetExerciseByIdUseCase(repository),
    new UpdateExerciseUseCase(repository),
    new DeleteExerciseUseCase(repository),
  ).register(router);

  return router;
}
