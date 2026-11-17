import { HTTPException } from "hono/http-exception";

import { globalErrorMapper } from "./errorMapper.js";

import type { ErrorHandler } from "hono";

export const errorHandler: ErrorHandler = (error, c) => {
  if (error instanceof HTTPException && error.status < 500) {
    return error.getResponse();
  }

  console.error("Unhandled HTTP error:", error);
  return c.json({ code: "INTERNAL_SERVER_ERROR" }, 500);
};

export const globalOnError: ErrorHandler = (error, c) => {
  return errorHandler(globalErrorMapper.map(error), c);
};
