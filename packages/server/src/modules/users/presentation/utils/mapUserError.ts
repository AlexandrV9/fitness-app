import { HTTPException } from "hono/http-exception";

import { UserNotFoundException } from "../../domain/exceptions/index.js";

export function mapUserError(error: Error): Error | null {
  if (error instanceof UserNotFoundException) {
    return new HTTPException(404, { message: error.message });
  }

  return null;
}
