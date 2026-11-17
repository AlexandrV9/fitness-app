import { OpenAPIHono } from "@hono/zod-openapi";
import { HTTPException } from "hono/http-exception";

import { pool } from "~/database/pool.js";
import { authMiddleware } from "~/modules/auth/presentation/utils/authMiddleware.js";
import { globalErrorMapper } from "~/shared/lib/errorMapper.js";

import { CreateWorkoutTemplateUseCase } from "../../application/use-cases/createWorkoutTemplate/index.js";
import { DeleteWorkoutTemplateUseCase } from "../../application/use-cases/deleteWorkoutTemplate/index.js";
import { GetWorkoutTemplateUseCase } from "../../application/use-cases/getWorkoutTemplate/index.js";
import { GetWorkoutTemplatesUseCase } from "../../application/use-cases/getWorkoutTemplates/index.js";
import { UpdateWorkoutTemplateUseCase } from "../../application/use-cases/updateWorkoutTemplate/index.js";
import { WorkoutTemplatesRepository } from "../../infrastructure/WorkoutTemplatesRepository.js";
import { mapWorkoutError } from "../utils/mapWorkoutError.js";
import { WorkoutTemplatesController } from "./WorkoutTemplatesController.js";

import type { AuthVariables } from "~/shared/lib/types.js";

export function createWorkoutTemplatesRouter() {
  globalErrorMapper.register(mapWorkoutError);

  const router = new OpenAPIHono<{ Variables: AuthVariables }>({
    defaultHook: (result) => {
      if (!result.success) {
        throw new HTTPException(400, { message: "INVALID_TEMPLATE_DATA" });
      }
    },
  });
  router.use("*", authMiddleware);

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
