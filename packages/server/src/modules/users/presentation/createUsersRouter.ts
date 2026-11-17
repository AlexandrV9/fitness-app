import { Hono } from "hono";

import { pool } from "../../../database/pool.js";
import { globalErrorMapper } from "../../../shared/lib/error-mapper.js";
import { authMiddleware } from "../../auth/presentation/authMiddleware.js";
import { GetUserUseCase } from "../application/use-cases/getUser/index.js";
import { UsersRepository } from "../infrastructure/UsersRepository.js";
import { mapUserError } from "./mapUserError.js";
import { UsersController } from "./UsersController.js";

import type { AuthVariables } from "../../../shared/lib/types.js";

export function createUsersRouter() {
  globalErrorMapper.register(mapUserError);

  const router = new Hono<{ Variables: AuthVariables }>();
  router.use("*", authMiddleware);

  const repository = new UsersRepository(pool);
  new UsersController(new GetUserUseCase(repository)).register(router);

  return router;
}
