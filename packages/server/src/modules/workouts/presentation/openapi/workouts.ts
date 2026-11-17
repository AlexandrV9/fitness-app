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
} from "~/shared/openapi/index.js";

export const SetSchema = z
  .object({
    id: z.uuid(),
    setNumber: z.number().int(),
    status: z.enum(["pending", "completed", "skipped"]),
    parameterValues: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])),
  })
  .openapi("WorkoutSet");

export const WorkoutExerciseSchema = z
  .object({
    id: z.uuid(),
    exerciseId: z.uuid().nullable(),
    name: z.string(),
    position: z.number().int(),
    isSkipped: z.boolean(),
    parameterSchema: z.array(z.unknown()),
    sets: z.array(SetSchema),
  })
  .openapi("WorkoutExercise");

export const WorkoutSchema = z
  .object({
    id: z.uuid(),
    userId: z.uuid(),
    templateId: z.uuid().nullable(),
    templateName: z.string(),
    startedAt: z.union([z.string(), z.date()]),
    finishedAt: z.union([z.string(), z.date()]).nullable(),
  })
  .openapi("Workout");

export const WorkoutDetailSchema = WorkoutSchema.extend({
  exercises: z.array(WorkoutExerciseSchema),
}).openapi("WorkoutDetail");

/** Separate name so `.nullable()` does not pollute `WorkoutDetail` in OpenAPI. */
const NullableWorkoutDetailSchema = WorkoutDetailSchema.nullable().openapi(
  "NullableWorkoutDetail",
);

export const StartWorkoutBodySchema = z
  .object({
    templateId: z.uuid(),
  })
  .openapi("StartWorkoutBody");

export const SaveSetBodySchema = z
  .discriminatedUnion("status", [
    z.object({
      status: z.literal("skipped"),
    }),
    z.object({
      status: z.literal("completed"),
      parameterValues: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])),
    }),
  ])
  .openapi("SaveSetBody");

const WorkoutsListSchema = z
  .object({
    success: z.literal(true),
    data: z.object({
      data: z.array(WorkoutSchema),
      pagination: PaginationMetaSchema,
    }),
  })
  .openapi("WorkoutsList");

const WorkoutIdParamsSchema = IdParamSchema;
const WorkoutExerciseParamsSchema = z.object({
  id: z.uuid(),
  exerciseId: z.uuid(),
});
const WorkoutSetParamsSchema = WorkoutExerciseParamsSchema.extend({
  setId: z.uuid(),
});

export const listWorkoutsRoute = createRoute({
  method: "get",
  path: "/",
  tags: ["Workouts"],
  summary: "List workouts",
  security: [...bearerAuthSecurity],
  request: {
    query: PaginationQuerySchema,
  },
  responses: {
    200: jsonResponse(WorkoutsListSchema, "Paginated workouts"),
    401: jsonResponse(ErrorCodeSchema, "Unauthorized"),
  },
});

export const getActiveWorkoutRoute = createRoute({
  method: "get",
  path: "/active",
  tags: ["Workouts"],
  summary: "Get active workout",
  security: [...bearerAuthSecurity],
  responses: {
    200: jsonResponse(successData(NullableWorkoutDetailSchema), "Active workout or null"),
    401: jsonResponse(ErrorCodeSchema, "Unauthorized"),
  },
});

export const getWorkoutRoute = createRoute({
  method: "get",
  path: "/{id}",
  tags: ["Workouts"],
  summary: "Get workout by id",
  security: [...bearerAuthSecurity],
  request: {
    params: WorkoutIdParamsSchema,
  },
  responses: {
    200: jsonResponse(successData(WorkoutDetailSchema), "Workout"),
    400: jsonResponse(ErrorCodeSchema, "Invalid workout id"),
    401: jsonResponse(ErrorCodeSchema, "Unauthorized"),
    404: jsonResponse(ErrorCodeSchema, "Workout not found"),
  },
});

export const startWorkoutRoute = createRoute({
  method: "post",
  path: "/start",
  tags: ["Workouts"],
  summary: "Start workout from template",
  operationId: "startWorkout",
  description: "Starts a new workout from a template, or returns the existing active workout for the same template.",
  security: [...bearerAuthSecurity],
  request: {
    body: {
      required: true,
      ...jsonBody(StartWorkoutBodySchema),
    },
  },
  responses: {
    200: jsonResponse(successData(WorkoutDetailSchema), "Existing active workout"),
    201: jsonResponse(successData(WorkoutDetailSchema), "Workout started"),
    400: jsonResponse(ErrorCodeSchema, "Invalid template id"),
    401: jsonResponse(ErrorCodeSchema, "Unauthorized"),
    404: jsonResponse(ErrorCodeSchema, "Template or user not found"),
    409: jsonResponse(ErrorCodeSchema, "Active workout already exists"),
  },
});

export const finishWorkoutRoute = createRoute({
  method: "post",
  path: "/{id}/finish",
  tags: ["Workouts"],
  summary: "Finish workout",
  security: [...bearerAuthSecurity],
  request: {
    params: WorkoutIdParamsSchema,
  },
  responses: {
    200: jsonResponse(successData(WorkoutDetailSchema), "Workout finished"),
    400: jsonResponse(ErrorCodeSchema, "Invalid workout id"),
    401: jsonResponse(ErrorCodeSchema, "Unauthorized"),
    404: jsonResponse(ErrorCodeSchema, "Workout not found"),
  },
});

export const skipWorkoutExerciseRoute = createRoute({
  method: "post",
  path: "/{id}/exercises/{exerciseId}/skip",
  tags: ["Workouts"],
  summary: "Skip workout exercise",
  security: [...bearerAuthSecurity],
  request: {
    params: WorkoutExerciseParamsSchema,
  },
  responses: {
    200: jsonResponse(successData(WorkoutDetailSchema), "Exercise skipped"),
    400: jsonResponse(ErrorCodeSchema, "Invalid ids"),
    401: jsonResponse(ErrorCodeSchema, "Unauthorized"),
    404: jsonResponse(ErrorCodeSchema, "Workout or exercise not found"),
  },
});

export const addWorkoutSetRoute = createRoute({
  method: "post",
  path: "/{id}/exercises/{exerciseId}/sets",
  tags: ["Workouts"],
  summary: "Add set to workout exercise",
  security: [...bearerAuthSecurity],
  request: {
    params: WorkoutExerciseParamsSchema,
  },
  responses: {
    201: jsonResponse(successData(SetSchema), "Set created"),
    400: jsonResponse(ErrorCodeSchema, "Invalid ids"),
    401: jsonResponse(ErrorCodeSchema, "Unauthorized"),
    404: jsonResponse(ErrorCodeSchema, "Workout or exercise not found"),
  },
});

export const saveWorkoutSetRoute = createRoute({
  method: "patch",
  path: "/{id}/exercises/{exerciseId}/sets/{setId}",
  tags: ["Workouts"],
  summary: "Save set result",
  security: [...bearerAuthSecurity],
  request: {
    params: WorkoutSetParamsSchema,
    body: {
      required: true,
      ...jsonBody(SaveSetBodySchema),
    },
  },
  responses: {
    200: jsonResponse(successData(SetSchema), "Set saved"),
    400: jsonResponse(ErrorCodeSchema, "Invalid set result"),
    401: jsonResponse(ErrorCodeSchema, "Unauthorized"),
    404: jsonResponse(ErrorCodeSchema, "Workout, exercise or set not found"),
  },
});
