import { HTTPException } from "hono/http-exception";
import z from "zod";

import { isObject, isUuid } from "../lib/guards.js";

import type { Context } from "hono";

import type { PaginationParams } from "../lib/pagination.js";
import type { AuthVariables } from "../lib/types.js";

export async function readRequestBody(c: Context): Promise<Record<string, unknown>> {
  const input = await c.req.json<unknown>().catch(() => null);

  if (!isObject(input)) {
    throw new HTTPException(400, { message: "INVALID_JSON_BODY" });
  }

  return input;
}

export function parsePaginationParams(query: Record<string, unknown>): PaginationParams {
  const schema = z.object({
    page: z.coerce.number().int().nonnegative().default(0),
    size: z.coerce.number().int().min(1).max(100).default(20),
  });

  const result = schema.safeParse(query);
  if (!result.success) {
    throw new HTTPException(400, { message: "INVALID_PAGINATION" });
  }

  return result.data;
}

export function getUserIdFromContext(c: Context<{ Variables: AuthVariables }>): string {
  const user = c.get("user");

  if (!user) {
    throw new HTTPException(401, { message: "Unauthorized" });
  }

  return user.id;
}

export function getPaginationParamsFromContext(c: Context): PaginationParams {
  return parsePaginationParams(c.req.query());
}

export function getParamFromContext(c: Context, paramName: string): string {
  const value = c.req.param(paramName);

  if (!value) {
    throw new HTTPException(400, { message: "MISSING_PARAM" });
  }

  return value;
}

export function getUuidParamFromContext(c: Context, paramName: string): string {
  const value = getParamFromContext(c, paramName);

  if (!isUuid(value)) {
    throw new HTTPException(400, {
      message: `INVALID_PARAM_${paramName.toUpperCase()}`,
    });
  }

  return value;
}
