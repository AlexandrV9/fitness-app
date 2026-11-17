import { Hono } from "hono";

import { pool } from "../../../database/pool.js";
import { globalErrorMapper } from "../../../shared/lib/error-mapper.js";
import { authenticate } from "../../auth/presentation/authenticate.js";
import { CreateWorkoutTemplateUseCase } from "../application/use-cases/createWorkoutTemplate/index.js";
import { DeleteWorkoutTemplateUseCase } from "../application/use-cases/deleteWorkoutTemplate/index.js";
import { GetWorkoutTemplateUseCase } from "../application/use-cases/getWorkoutTemplate/index.js";
import { GetWorkoutTemplatesUseCase } from "../application/use-cases/getWorkoutTemplates/index.js";
import { UpdateWorkoutTemplateUseCase } from "../application/use-cases/updateWorkoutTemplate/index.js";
import { WorkoutTemplatesRepository } from "../infrastructure/WorkoutTemplatesRepository.js";
import { WorkoutTemplatesController } from "./WorkoutTemplatesController.js";
import { mapWorkoutError } from "./utils/mapWorkoutError.js";

import type { AuthVariables } from "../../auth/presentation/createAuthMiddleware.js";

export function createWorkoutTemplatesRouter() {
  globalErrorMapper.register(mapWorkoutError);

  const router = new Hono<{ Variables: AuthVariables }>();
  router.use("*", authenticate);

  const repository = new WorkoutTemplatesRepository(pool);

  new WorkoutTemplatesController(
    new GetWorkoutTemplatesUseCase(repository),
    new GetWorkoutTemplateUseCase(repository),
    new CreateWorkoutTemplateUseCase(repository),
    new UpdateWorkoutTemplateUseCase(repository),
    new DeleteWorkoutTemplateUseCase(repository),
  ).register(router);

  return router;
}
