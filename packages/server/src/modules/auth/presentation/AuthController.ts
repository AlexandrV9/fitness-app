import { HTTPException } from "hono/http-exception";
import { z } from "zod";

import { readRequestBody } from "../../../shared/hono/index.js";

import type { SignInUseCase } from "../application/use-cases/signIn/index.js";
import type { SignUpUseCase } from "../application/use-cases/signUp/index.js";
import type { Context, Hono } from "hono";

const credentialsSchema = z.object({
  login: z.string().trim().min(1).max(64),
  password: z.string().min(8).max(128),
});

export class AuthController {
  constructor(
    private readonly signUpUseCase: SignUpUseCase,
    private readonly signInUseCase: SignInUseCase,
  ) {}

  register(router: Hono): void {
    router.post("/sign-up", this.handleSignUp);
    router.post("/sign-in", this.handleSignIn);
  }

  private handleSignUp = async (c: Context) => {
    const request = credentialsSchema.safeParse(await readRequestBody(c));

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
}
