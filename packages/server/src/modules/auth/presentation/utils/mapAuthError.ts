import { HTTPException } from "hono/http-exception";

import { UserAlreadyExistsException } from "~/modules/users/domain/exceptions/index.js";

import {
  InvalidCredentialsException,
  InvalidRefreshTokenException,
  WeakPasswordException,
} from "../../domain/exceptions/index.js";

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

  if (error instanceof UserAlreadyExistsException) {
    return new HTTPException(409, { message: "USER_ALREADY_EXISTS" });
  }

  return null;
}
