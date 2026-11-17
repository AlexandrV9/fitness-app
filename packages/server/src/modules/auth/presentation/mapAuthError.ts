import { HTTPException } from "hono/http-exception";

import { InvalidCredentialsException } from "../domain/exceptions/InvalidCredentialsException.js";
import { InvalidRefreshTokenException } from "../domain/exceptions/InvalidRefreshTokenException.js";
import { WeakPasswordException } from "../domain/exceptions/WeakPasswordException.js";

export function mapAuthError(error: Error): Error | null {
  if (
    error instanceof InvalidCredentialsException ||
    error instanceof InvalidRefreshTokenException
  ) {
    return new HTTPException(401, { message: error.message });
  }

  if (error instanceof WeakPasswordException) {
    return new HTTPException(400, { message: error.message });
  }

  return null;
}
