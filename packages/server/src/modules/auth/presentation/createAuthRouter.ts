import { Hono } from "hono";

import { pool } from "../../../database/pool.js";
import { BcryptPasswordHasher } from "../../users/infrastructure/BcryptPasswordHasher.js";
import { UsersRepository } from "../../users/infrastructure/UsersRepository.js";
import { SignInUseCase } from "../application/use-cases/signIn/index.js";
import { SignUpUseCase } from "../application/use-cases/signUp/index.js";
import { JwtAuthTokenManager } from "../infrastructure/JwtAuthTokenManager.js";
import { AuthController } from "./AuthController.js";

export function createAuthRouter() {
  const router = new Hono();

  const usersRepository = new UsersRepository(pool);
  const passwordHasher = new BcryptPasswordHasher();
  const jwtAuthTokenManager = new JwtAuthTokenManager();

  new AuthController(
    new SignUpUseCase(usersRepository, passwordHasher, jwtAuthTokenManager),
    new SignInUseCase(usersRepository, passwordHasher, jwtAuthTokenManager),
  ).register(router);

  return router;
}
