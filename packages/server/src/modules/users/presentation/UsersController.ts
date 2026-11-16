import { getUserIdFromContext } from "../../../shared/hono/index.js";

import type { AuthVariables } from "../../auth/presentation/createAuthMiddleware.js";
import type { GetUserUseCase } from "../application/use-cases/getUser/index.js";
import type { Context, Hono } from "hono";

type AuthData = { Variables: AuthVariables };

export class UsersController {
  constructor(private readonly getUserUseCase: GetUserUseCase) {}

  register(router: Hono<AuthData>): void {
    router.get("/me", this.handleGetCurrentUser);
  }

  private handleGetCurrentUser = async (c: Context<AuthData>) => {
    const user = await this.getUserUseCase.execute(getUserIdFromContext(c));
    return c.json({ success: true, data: user });
  };
}
