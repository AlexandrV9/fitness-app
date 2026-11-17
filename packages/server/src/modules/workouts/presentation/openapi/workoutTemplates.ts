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

export const TemplateExerciseInputSchema = z
  .object({
    exerciseId: z.uuid(),
    plannedSets: z.number().int().min(1).max(100).nullable().optional().default(null),
  })
  .openapi("TemplateExerciseInput");

export const TemplateExerciseSchema = z
  .object({
    id: z.uuid(),
    name: z.string(),
    position: z.number().int(),
    exerciseId: z.uuid(),
    plannedSets: z.number().int().nullable(),
  })
  .openapi("TemplateExercise");

export const WorkoutTemplateSchema = z
  .object({
    id: z.uuid(),
    userId: z.uuid(),
    name: z.string(),
  })
  .openapi("WorkoutTemplate");

export const WorkoutTemplateDetailSchema = WorkoutTemplateSchema.extend({
  exercises: z.array(TemplateExerciseSchema),
}).openapi("WorkoutTemplateDetail");

export const CreateWorkoutTemplateBodySchema = z
  .object({
    name: z.string().trim().min(1).max(100),
    exercises: z.array(TemplateExerciseInputSchema).min(1).max(100),
  })
  .openapi("CreateWorkoutTemplateBody");

export const UpdateWorkoutTemplateBodySchema = z
  .object({
    name: z.string().trim().min(1).max(100).optional(),
    exercises: z.array(TemplateExerciseInputSchema).min(1).max(100).optional(),
  })
  .openapi("UpdateWorkoutTemplateBody");

const TemplatesListSchema = z
  .object({
    success: z.literal(true),
    data: z.array(WorkoutTemplateSchema),
    pagination: PaginationMetaSchema,
  })
  .openapi("WorkoutTemplatesList");

export const listWorkoutTemplatesRoute = createRoute({
  method: "get",
  path: "/",
  tags: ["Workout Templates"],
  summary: "List workout templates",
  security: [...bearerAuthSecurity],
  request: {
    query: PaginationQuerySchema,
  },
  responses: {
    200: jsonResponse(TemplatesListSchema, "Paginated workout templates"),
    401: jsonResponse(ErrorCodeSchema, "Unauthorized"),
  },
});

export const createWorkoutTemplateRoute = createRoute({
  method: "post",
  path: "/",
  tags: ["Workout Templates"],
  summary: "Create workout template",
  security: [...bearerAuthSecurity],
  request: {
    body: {
      required: true,
      ...jsonBody(CreateWorkoutTemplateBodySchema),
    },
  },
  responses: {
    201: jsonResponse(successData(WorkoutTemplateDetailSchema), "Template created"),
    400: jsonResponse(ErrorCodeSchema, "Invalid template data"),
    401: jsonResponse(ErrorCodeSchema, "Unauthorized"),
  },
});

export const getWorkoutTemplateRoute = createRoute({
  method: "get",
  path: "/{id}",
  tags: ["Workout Templates"],
  summary: "Get workout template by id",
  security: [...bearerAuthSecurity],
  request: {
    params: IdParamSchema,
  },
  responses: {
    200: jsonResponse(successData(WorkoutTemplateDetailSchema), "Template"),
    400: jsonResponse(ErrorCodeSchema, "Invalid template id"),
    401: jsonResponse(ErrorCodeSchema, "Unauthorized"),
    404: jsonResponse(ErrorCodeSchema, "Template not found"),
  },
});

export const updateWorkoutTemplateRoute = createRoute({
  method: "patch",
  path: "/{id}",
  tags: ["Workout Templates"],
  summary: "Update workout template",
  security: [...bearerAuthSecurity],
  request: {
    params: IdParamSchema,
    body: {
      required: true,
      ...jsonBody(UpdateWorkoutTemplateBodySchema),
    },
  },
  responses: {
    200: jsonResponse(successData(WorkoutTemplateDetailSchema), "Template updated"),
    400: jsonResponse(ErrorCodeSchema, "Invalid template data"),
    401: jsonResponse(ErrorCodeSchema, "Unauthorized"),
    404: jsonResponse(ErrorCodeSchema, "Template not found"),
  },
});

export const deleteWorkoutTemplateRoute = createRoute({
  method: "delete",
  path: "/{id}",
  tags: ["Workout Templates"],
  summary: "Delete workout template",
  security: [...bearerAuthSecurity],
  request: {
    params: IdParamSchema,
  },
  responses: {
    200: jsonResponse(successNullSchema, "Template deleted"),
    400: jsonResponse(ErrorCodeSchema, "Invalid template id"),
    401: jsonResponse(ErrorCodeSchema, "Unauthorized"),
    404: jsonResponse(ErrorCodeSchema, "Template not found"),
  },
});
