import { OpenAPIHono } from "@hono/zod-openapi";
import { HTTPException } from "hono/http-exception";

import { pool } from "~/database/pool.js";
import { authMiddleware } from "~/modules/auth/presentation/utils/authMiddleware.js";
import { globalErrorMapper } from "~/shared/lib/errorMapper.js";

import { GetUserUseCase } from "../../application/use-cases/getUser/index.js";
import { UsersRepository } from "../../infrastructure/UsersRepository.js";
import { mapUserError } from "../utils/mapUserError.js";
import { UsersController } from "./UsersController.js";

import type { AuthVariables } from "~/shared/lib/types.js";

export function createUsersRouter() {
  globalErrorMapper.register(mapUserError);

  const router = new OpenAPIHono<{ Variables: AuthVariables }>({
    defaultHook: (result) => {
      if (!result.success) {
        throw new HTTPException(400, { message: "INVALID_USER_DATA" });
      }
    },
  });
  router.use("*", authMiddleware);

  const repository = new UsersRepository(pool);
  new UsersController(new GetUserUseCase(repository)).register(router);

  return router;
}
