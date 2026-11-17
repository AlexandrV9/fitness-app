import { createRoute, z } from "@hono/zod-openapi";

import {
  bearerAuthSecurity,
  ErrorCodeSchema,
  jsonResponse,
  successData,
} from "~/shared/openapi/index.js";

export const UserSchema = z
  .object({
    id: z.uuid(),
    login: z.string(),
  })
  .openapi("User");

export const getCurrentUserRoute = createRoute({
  method: "get",
  path: "/me",
  tags: ["Users"],
  summary: "Get current authenticated user",
  security: [...bearerAuthSecurity],
  responses: {
    200: jsonResponse(successData(UserSchema), "Current user"),
    401: jsonResponse(ErrorCodeSchema, "Unauthorized"),
    404: jsonResponse(ErrorCodeSchema, "User not found"),
  },
});
