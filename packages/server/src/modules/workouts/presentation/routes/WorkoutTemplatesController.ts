import { HTTPException } from "hono/http-exception";

import { getUserIdFromContext } from "~/shared/hono/context.js";

import {
  createWorkoutTemplateRoute,
  deleteWorkoutTemplateRoute,
  getWorkoutTemplateRoute,
  listWorkoutTemplatesRoute,
  updateWorkoutTemplateRoute,
} from "../openapi/workoutTemplates.js";

import type { OpenAPIHono } from "@hono/zod-openapi";

import type { AuthVariables } from "~/shared/lib/types.js";

import type { CreateWorkoutTemplateUseCase } from "../../application/use-cases/createWorkoutTemplate/index.js";
import type { DeleteWorkoutTemplateUseCase } from "../../application/use-cases/deleteWorkoutTemplate/index.js";
import type { GetWorkoutTemplateUseCase } from "../../application/use-cases/getWorkoutTemplate/index.js";
import type { GetWorkoutTemplatesUseCase } from "../../application/use-cases/getWorkoutTemplates/index.js";
import type { UpdateWorkoutTemplateUseCase } from "../../application/use-cases/updateWorkoutTemplate/index.js";

type AuthEnv = { Variables: AuthVariables };

export class WorkoutTemplatesController {
  constructor(
    private readonly getWorkoutTemplatesUseCase: GetWorkoutTemplatesUseCase,
    private readonly getWorkoutTemplateUseCase: GetWorkoutTemplateUseCase,
    private readonly createWorkoutTemplateUseCase: CreateWorkoutTemplateUseCase,
    private readonly updateWorkoutTemplateUseCase: UpdateWorkoutTemplateUseCase,
    private readonly deleteWorkoutTemplateUseCase: DeleteWorkoutTemplateUseCase,
  ) {}

  register(router: OpenAPIHono<AuthEnv>): void {
    router.openapi(listWorkoutTemplatesRoute, async (c) => {
      const { page, size } = c.req.valid("query");
      const result = await this.getWorkoutTemplatesUseCase.execute(getUserIdFromContext(c), {
        page,
        size,
      });
      return c.json({ success: true as const, ...result }, 200);
    });

    router.openapi(createWorkoutTemplateRoute, async (c) => {
      const body = c.req.valid("json");
      const template = await this.createWorkoutTemplateUseCase.execute(getUserIdFromContext(c), {
        name: body.name.trim(),
        exercises: body.exercises,
      });
      return c.json({ success: true as const, data: template }, 201);
    });

    router.openapi(getWorkoutTemplateRoute, async (c) => {
      const { id } = c.req.valid("param");
      const template = await this.getWorkoutTemplateUseCase.execute(getUserIdFromContext(c), id);
      return c.json({ success: true as const, data: template }, 200);
    });

    router.openapi(updateWorkoutTemplateRoute, async (c) => {
      const { id } = c.req.valid("param");
      const body = c.req.valid("json");

      if (body.name === undefined && body.exercises === undefined) {
        throw new HTTPException(400, { message: "EMPTY_UPDATE" });
      }

      const template = await this.updateWorkoutTemplateUseCase.execute(
        getUserIdFromContext(c),
        id,
        {
          name: body.name === undefined ? undefined : body.name.trim(),
          exercises: body.exercises,
        },
      );
      return c.json({ success: true as const, data: template }, 200);
    });

    router.openapi(deleteWorkoutTemplateRoute, async (c) => {
      const { id } = c.req.valid("param");
      await this.deleteWorkoutTemplateUseCase.execute(getUserIdFromContext(c), id);
      return c.json({ success: true as const, data: null }, 200);
    });
  }
}
