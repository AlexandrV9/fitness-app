import type { IJwtAuthTokenManager } from "../domain/interfaces/IJwtAuthTokenManager.js";
import type { MiddlewareHandler } from "hono";

export type AuthVariables = {
  user: {
    id: string;
  };
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isUuid(value: string): boolean {
  return UUID_RE.test(value);
}

/**
 * Bearer access JWT → c.set("user", { id }).
 */
export const createAuthMiddleware = (
  jwtAuthTokenManager: IJwtAuthTokenManager,
): MiddlewareHandler<{ Variables: AuthVariables }> => {
  return async (c, next) => {
    const authHeader = c.req.header("Authorization");

    if (!authHeader) {
      return c.json({ message: "Unauthorized" }, 401);
    }

    const token = jwtAuthTokenManager.extractTokenFromAuthHeader(authHeader);
    if (!token) {
      return c.json({ message: "Unauthorized" }, 401);
    }

    const verified = await jwtAuthTokenManager.verifyAccessToken(token);
    if (!verified.success) {
      return c.json({ message: "Invalid token" }, 401);
    }

    const userId = String(verified.payload.data.id);
    if (!isUuid(userId)) {
      return c.json({ message: "Invalid token" }, 401);
    }

    c.set("user", { id: userId });
    await next();
  };
};
