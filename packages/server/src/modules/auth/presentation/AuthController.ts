import { logoutRoute, refreshRoute, signInRoute, signUpRoute } from "./authOpenApi.js";

import type { SignInUseCase } from "../application/use-cases/signIn/index.js";
import type { SignUpUseCase } from "../application/use-cases/signUp/index.js";
import type { IAuthSessionsService } from "../domain/interfaces/IAuthSessionsService.js";
import type { OpenAPIHono } from "@hono/zod-openapi";

export class AuthController {
  constructor(
    private readonly signUpUseCase: SignUpUseCase,
    private readonly signInUseCase: SignInUseCase,
    private readonly sessions: Pick<IAuthSessionsService, "refresh" | "logout">,
  ) {}

  register(router: OpenAPIHono): void {
    router.openapi(signUpRoute, async (c) => {
      const body = c.req.valid("json");

      const result = await this.signUpUseCase.execute(body);

      return c.json({ success: true as const, data: result }, 201);
    });

    router.openapi(signInRoute, async (c) => {
      const body = c.req.valid("json");

      const result = await this.signInUseCase.execute(body);

      return c.json({ success: true as const, data: result }, 200);
    });

    router.openapi(refreshRoute, async (c) => {
      const { refreshToken } = c.req.valid("json");

      const result = await this.sessions.refresh(refreshToken);

      return c.json({ success: true as const, data: result }, 200);
    });

    router.openapi(logoutRoute, async (c) => {
      const { refreshToken } = c.req.valid("json");

      await this.sessions.logout(refreshToken);

      return c.body(null, 204);
    });
  }
}
