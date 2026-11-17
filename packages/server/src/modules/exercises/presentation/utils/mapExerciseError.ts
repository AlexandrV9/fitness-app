import { HTTPException } from "hono/http-exception";

import {
  ExerciseCreateFailedException,
  ExerciseInvalidParameterSchemaException,
  ExerciseNotFoundException,
} from "../../domain/exceptions/index.js";

export function mapExerciseError(error: Error): Error | null {
  if (error instanceof ExerciseNotFoundException) {
    return new HTTPException(404, { message: error.message });
  }

  if (error instanceof ExerciseInvalidParameterSchemaException) {
    return new HTTPException(422, { message: error.message });
  }

  if (error instanceof ExerciseCreateFailedException) {
    return new HTTPException(500, { message: error.message });
  }

  return null;
}
