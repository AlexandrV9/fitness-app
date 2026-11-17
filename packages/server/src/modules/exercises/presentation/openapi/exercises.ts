import { createRoute, z } from "@hono/zod-openapi";

import {
  bearerAuthSecurity,
  ErrorCodeSchema,
  IdParamSchema,
  jsonBody,
  jsonResponse,
  PaginationMetaSchema,
  PaginationQuerySchema,
  successData,
  successNullSchema,
} from "~/shared/openapi/index.js";

const ParameterFieldSchema = z
  .object({
    key: z.string().min(1),
    type: z.enum(["integer", "number", "string", "boolean"]),
    required: z.boolean().optional(),
    min: z.number().optional(),
    max: z.number().optional(),
    minLength: z.number().int().nonnegative().optional(),
    maxLength: z.number().int().nonnegative().optional(),
  })
  .openapi("ParameterField");

export const ExerciseSchema = z
  .object({
    id: z.uuid(),
    userId: z.uuid(),
    name: z.string(),
    parameterSchema: z.array(z.unknown()),
  })
  .openapi("Exercise");

export const CreateExerciseBodySchema = z
  .object({
    name: z.string().trim().min(1).max(100),
    parameterSchema: z.array(ParameterFieldSchema).optional(),
  })
  .openapi("CreateExerciseBody");

export const UpdateExerciseBodySchema = z
  .object({
    name: z.string().trim().min(1).max(100).optional(),
    parameterSchema: z.array(ParameterFieldSchema).optional(),
  })
  .openapi("UpdateExerciseBody");

const ExercisesListSchema = z
  .object({
    success: z.literal(true),
    data: z.array(ExerciseSchema),
    pagination: PaginationMetaSchema,
  })
  .openapi("ExercisesList");

const listQuerySchema = PaginationQuerySchema.extend({
  query: z.string().trim().optional().openapi({ description: "Search by exercise name" }),
});

export const listExercisesRoute = createRoute({
  method: "get",
  path: "/",
  tags: ["Exercises"],
  summary: "List exercises",
  security: [...bearerAuthSecurity],
  request: {
    query: listQuerySchema,
  },
  responses: {
    200: jsonResponse(ExercisesListSchema, "Paginated exercises"),
    401: jsonResponse(ErrorCodeSchema, "Unauthorized"),
  },
});

export const createExerciseRoute = createRoute({
  method: "post",
  path: "/",
  tags: ["Exercises"],
  summary: "Create exercise",
  security: [...bearerAuthSecurity],
  request: {
    body: {
      required: true,
      ...jsonBody(CreateExerciseBodySchema),
    },
  },
  responses: {
    201: jsonResponse(successData(ExerciseSchema), "Exercise created"),
    400: jsonResponse(ErrorCodeSchema, "Invalid exercise data"),
    401: jsonResponse(ErrorCodeSchema, "Unauthorized"),
  },
});

export const getExerciseRoute = createRoute({
  method: "get",
  path: "/{id}",
  tags: ["Exercises"],
  summary: "Get exercise by id",
  security: [...bearerAuthSecurity],
  request: {
    params: IdParamSchema,
  },
  responses: {
    200: jsonResponse(successData(ExerciseSchema), "Exercise"),
    400: jsonResponse(ErrorCodeSchema, "Invalid exercise id"),
    401: jsonResponse(ErrorCodeSchema, "Unauthorized"),
    404: jsonResponse(ErrorCodeSchema, "Exercise not found"),
  },
});

export const updateExerciseRoute = createRoute({
  method: "patch",
  path: "/{id}",
  tags: ["Exercises"],
  summary: "Update exercise",
  security: [...bearerAuthSecurity],
  request: {
    params: IdParamSchema,
    body: {
      required: true,
      ...jsonBody(UpdateExerciseBodySchema),
    },
  },
  responses: {
    200: jsonResponse(successData(ExerciseSchema), "Exercise updated"),
    400: jsonResponse(ErrorCodeSchema, "Invalid exercise data"),
    401: jsonResponse(ErrorCodeSchema, "Unauthorized"),
    404: jsonResponse(ErrorCodeSchema, "Exercise not found"),
  },
});

export const deleteExerciseRoute = createRoute({
  method: "delete",
  path: "/{id}",
  tags: ["Exercises"],
  summary: "Delete exercise",
  security: [...bearerAuthSecurity],
  request: {
    params: IdParamSchema,
  },
  responses: {
    200: jsonResponse(successNullSchema, "Exercise deleted"),
    400: jsonResponse(ErrorCodeSchema, "Invalid exercise id"),
    401: jsonResponse(ErrorCodeSchema, "Unauthorized"),
    404: jsonResponse(ErrorCodeSchema, "Exercise not found"),
  },
});
