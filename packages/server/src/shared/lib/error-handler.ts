import type { ErrorHandler } from 'hono'
import { HTTPException } from 'hono/http-exception'

export const errorHandler: ErrorHandler = (error, c) => {
  if (error instanceof HTTPException && error.status < 500) {
    return c.json({ code: error.message }, error.status)
  }

  console.error('Unhandled HTTP error:', error)
  return c.json({ code: 'INTERNAL_SERVER_ERROR' }, 500)
}
