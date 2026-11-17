import { getUserIdFromContext } from "~/shared/hono/index.js";

import { getCurrentUserRoute } from "../openapi/users.js";

import type { OpenAPIHono } from "@hono/zod-openapi";

import type { AuthVariables } from "~/shared/lib/types.js";

import type { GetUserUseCase } from "../../application/use-cases/getUser/index.js";

type AuthEnv = { Variables: AuthVariables };

export class UsersController {
  constructor(private readonly getUserUseCase: GetUserUseCase) {}

  register(router: OpenAPIHono<AuthEnv>): void {
    router.openapi(getCurrentUserRoute, async (c) => {
      const user = await this.getUserUseCase.execute(getUserIdFromContext(c));
      return c.json({ success: true as const, data: user }, 200);
    });
  }
}
