import { OpenAPIHono } from "@hono/zod-openapi";
import { HTTPException } from "hono/http-exception";

import { pool } from "~/database/pool.js";
import { authMiddleware } from "~/modules/auth/presentation/utils/authMiddleware.js";
import { globalErrorMapper } from "~/shared/lib/errorMapper.js";

import { AddSetUseCase } from "../../application/use-cases/addSet/index.js";
import { DeleteSetUseCase } from "../../application/use-cases/deleteSet/index.js";
import { FinishWorkoutUseCase } from "../../application/use-cases/finishWorkout/index.js";
import { GetActiveWorkoutUseCase } from "../../application/use-cases/getActiveWorkout/index.js";
import { GetWorkoutByIdUseCase } from "../../application/use-cases/getWorkoutById/index.js";
import { GetWorkoutsUseCase } from "../../application/use-cases/getWorkouts/index.js";
import { SaveSetUseCase } from "../../application/use-cases/saveSet/index.js";
import { SkipExerciseUseCase } from "../../application/use-cases/skipExercise/index.js";
import { StartWorkoutUseCase } from "../../application/use-cases/startWorkout/index.js";
import { WorkoutsRepository } from "../../infrastructure/WorkoutsRepository.js";
import { mapWorkoutError } from "../utils/mapWorkoutError.js";
import { WorkoutsController } from "./WorkoutsController.js";

import type { AuthVariables } from "~/shared/lib/types.js";

export function createWorkoutsRouter() {
  globalErrorMapper.register(mapWorkoutError);

  const router = new OpenAPIHono<{ Variables: AuthVariables }>({
    defaultHook: (result) => {
      if (!result.success) {
        throw new HTTPException(400, { message: "INVALID_WORKOUT_DATA" });
      }
    },
  });
  router.use("*", authMiddleware);

  const repository = new WorkoutsRepository(pool);

  new WorkoutsController(
    new GetWorkoutsUseCase(repository),
    new GetActiveWorkoutUseCase(repository),
    new GetWorkoutByIdUseCase(repository),
    new StartWorkoutUseCase(repository),
    new FinishWorkoutUseCase(repository),
    new SkipExerciseUseCase(repository),
    new AddSetUseCase(repository),
    new SaveSetUseCase(repository),
    new DeleteSetUseCase(repository),
  ).register(router);

  return router;
}
