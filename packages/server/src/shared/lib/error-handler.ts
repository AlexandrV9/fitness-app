import type { ErrorHandler } from "hono";
import { HTTPException } from "hono/http-exception";

export const errorHandler: ErrorHandler = (error, c) => {
  if (error instanceof HTTPException && error.status < 500) {
    if (error.res) {
      return new Response(error.res.body, {
        status: error.status,
        headers: error.res.headers,
      });
    }

    return c.json({ code: error.message }, error.status);
  }

  console.error("Unhandled HTTP error:", error);
  return c.json({ code: "INTERNAL_SERVER_ERROR" }, 500);
};
