import { HTTPException } from "hono/http-exception";
import { z } from "zod";

import { readRequestBody } from "../../../shared/hono/index.js";

import type { SignInUseCase } from "../application/use-cases/signIn/index.js";
import type { SignUpUseCase } from "../application/use-cases/signUp/index.js";
import type { IAuthSessionsService } from "../domain/interfaces/IAuthSessionsService.js";
import type { Context, Hono } from "hono";

const credentialsSchema = z.object({
  login: z.string().trim().min(1).max(254),
  password: z.string().min(8).max(128),
});
const signUpSchema = credentialsSchema.extend({ login: credentialsSchema.shape.login.max(64) });
const refreshRequest = z.object({ refreshToken: z.string().min(1).max(4096) });

export class AuthController {
  constructor(
    private readonly signUpUseCase: SignUpUseCase,
    private readonly signInUseCase: SignInUseCase,
    private readonly sessions: Pick<IAuthSessionsService, "refresh" | "logout">,
  ) {}

  register(router: Hono): void {
    router.post("/sign-up", this.handleSignUp);
    router.post("/sign-in", this.handleSignIn);
    router.post("/refresh", this.handleRefresh);
    router.post("/logout", this.handleLogout);
  }

  private handleSignUp = async (c: Context) => {
    const request = signUpSchema.safeParse(await readRequestBody(c));

    if (!request.success) {
      throw new HTTPException(400, { message: "INVALID_AUTH_DATA" });
    }

    const result = await this.signUpUseCase.execute(request.data);
    return c.json({ success: true, data: result }, 201);
  };

  private handleSignIn = async (c: Context) => {
    const request = credentialsSchema.safeParse(await readRequestBody(c));

    if (!request.success) {
      throw new HTTPException(400, { message: "INVALID_AUTH_DATA" });
    }

    const result = await this.signInUseCase.execute(request.data);
    return c.json({ success: true, data: result });
  };

  private handleRefresh = async (c: Context) => {
    const result = await this.sessions.refresh(await this.readRefreshToken(c));
    return c.json({ success: true, data: result });
  };

  private handleLogout = async (c: Context) => {
    await this.sessions.logout(await this.readRefreshToken(c));
    return c.body(null, 204);
  };

  private async readRefreshToken(c: Context): Promise<string> {
    const request = refreshRequest.safeParse(await readRequestBody(c));
    if (!request.success) {
      throw new HTTPException(400, { message: "INVALID_AUTH_DATA" });
    }
    return request.data.refreshToken;
  }
}
