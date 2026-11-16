import type { AuthUserPayload } from "./IJwtAuthTokenManager.js";
import type { JWTPayload } from "hono/utils/jwt/types";

export type AuthJWTPayload = JWTPayload & {
  data: AuthUserPayload;
};
