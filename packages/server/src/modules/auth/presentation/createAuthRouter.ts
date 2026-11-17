import { Hono } from "hono";

import { config } from "../../../config/index.js";
import { pool } from "../../../database/pool.js";
import { globalErrorMapper } from "../../../shared/lib/error-mapper.js";
import { BcryptPasswordHasher } from "../../users/infrastructure/BcryptPasswordHasher.js";
import { UsersRepository } from "../../users/infrastructure/UsersRepository.js";
import { SignInUseCase } from "../application/use-cases/signIn/index.js";
import { SignUpUseCase } from "../application/use-cases/signUp/index.js";
import { JwtAuthTokenManager } from "../infrastructure/JwtAuthTokenManager.js";
import { RefreshSessionsRepository } from "../infrastructure/RefreshSessionsRepository.js";
import { AuthSessionsService } from "../services/AuthSessions/index.js";
import { AuthController } from "./AuthController.js";
import { mapAuthError } from "./mapAuthError.js";

export function createAuthRouter() {
  globalErrorMapper.register(mapAuthError);

  const router = new Hono();

  router.use("*", async (c, next) => {
    c.header("Cache-Control", "no-store");
    await next();
  });

  const usersRepository = new UsersRepository(pool);
  const refreshSessionsRepository = new RefreshSessionsRepository(pool);

  const jwtAuthTokenManager = new JwtAuthTokenManager();
  const passwordHasher = new BcryptPasswordHasher();

  const sessions = new AuthSessionsService(
    jwtAuthTokenManager,
    refreshSessionsRepository,
    config.auth.refreshToken.expInSec,
  );

  new AuthController(
    new SignUpUseCase(usersRepository, passwordHasher, sessions),
    new SignInUseCase(usersRepository, passwordHasher, sessions),
    sessions,
  ).register(router);

  return router;
}
