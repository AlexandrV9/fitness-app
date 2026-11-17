import type { JWTPayload } from "hono/utils/jwt/types";

import type { AuthUserPayload } from "./IJwtAuthTokenManager.js";

export type AuthJWTPayload = JWTPayload & {
  data: AuthUserPayload;
  sid?: string;
};
