import { HTTPException } from "hono/http-exception";

import { UserAlreadyExistsException } from "../domain/exceptions/UserAlreadyExistsException.js";
import { UserNotFoundException } from "../domain/exceptions/UserNotFoundException.js";

export function mapUserError(error: Error): Error {
  if (error instanceof UserAlreadyExistsException) {
    return new HTTPException(409, { message: "USER_ALREADY_EXISTS" });
  }

  if (error instanceof UserNotFoundException) {
    return new HTTPException(404, { message: error.message });
  }

  return error;
}
