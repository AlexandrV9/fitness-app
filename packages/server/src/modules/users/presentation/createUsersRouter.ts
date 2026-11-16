import { Hono } from "hono";

import { pool } from "../../../database/pool.js";
import { authenticate } from "../../auth/presentation/authenticate.js";
import { GetUserUseCase } from "../application/use-cases/getUser/index.js";
import { UsersRepository } from "../infrastructure/UsersRepository.js";
import { UsersController } from "./UsersController.js";

import type { AuthVariables } from "../../auth/presentation/createAuthMiddleware.js";

export function createUsersRouter() {
  const router = new Hono<{ Variables: AuthVariables }>();
  router.use("*", authenticate);

  const repository = new UsersRepository(pool);
  new UsersController(new GetUserUseCase(repository)).register(router);

  return router;
}
