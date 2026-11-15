import { HTTPException } from 'hono/http-exception'

import { ExerciseInvalidParameterSchemaException } from '../../domain/exceptions/index.js'

export function validateParameterSchema(schema: unknown): unknown[] {
  if (!Array.isArray(schema)) {
    throw new HTTPException(422, {
      message: new ExerciseInvalidParameterSchemaException().message,
    })
  }

  return schema
}
