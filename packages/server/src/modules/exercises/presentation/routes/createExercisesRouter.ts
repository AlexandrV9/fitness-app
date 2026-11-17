import { OpenAPIHono } from "@hono/zod-openapi";
import { HTTPException } from "hono/http-exception";

import { pool } from "~/database/pool.js";
import { authMiddleware } from "~/modules/auth/presentation/utils/authMiddleware.js";
import { globalErrorMapper } from "~/shared/lib/errorMapper.js";

import { CreateExerciseUseCase } from "../../application/use-cases/createExercise/index.js";
import { DeleteExerciseUseCase } from "../../application/use-cases/deleteExercise/index.js";
import { GetExerciseByIdUseCase } from "../../application/use-cases/getExerciseById/index.js";
import { GetExercisesUseCase } from "../../application/use-cases/getExercises/index.js";
import { UpdateExerciseUseCase } from "../../application/use-cases/updateExercise/index.js";
import { ExercisesRepository } from "../../infrastructure/ExercisesRepository.js";
import { mapExerciseError } from "../utils/mapExerciseError.js";
import { ExercisesController } from "./ExercisesController.js";

import type { AuthVariables } from "~/shared/lib/types.js";

export function createExercisesRouter() {
  globalErrorMapper.register(mapExerciseError);

  const router = new OpenAPIHono<{ Variables: AuthVariables }>({
    defaultHook: (result) => {
      if (!result.success) {
        throw new HTTPException(400, { message: "INVALID_EXERCISE_DATA" });
      }
    },
  });
  router.use("*", authMiddleware);

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
