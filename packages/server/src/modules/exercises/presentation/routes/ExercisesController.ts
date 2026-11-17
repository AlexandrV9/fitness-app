import { HTTPException } from "hono/http-exception";

import {
  createExerciseRoute,
  deleteExerciseRoute,
  getExerciseRoute,
  listExercisesRoute,
  updateExerciseRoute,
} from "../openapi/exercises.js";

import type { OpenAPIHono } from "@hono/zod-openapi";

import type { AuthVariables } from "~/shared/lib/types.js";

import type { CreateExerciseUseCase } from "../../application/use-cases/createExercise/index.js";
import type { DeleteExerciseUseCase } from "../../application/use-cases/deleteExercise/index.js";
import type { GetExerciseByIdUseCase } from "../../application/use-cases/getExerciseById/index.js";
import type { GetExercisesUseCase } from "../../application/use-cases/getExercises/index.js";
import type { UpdateExerciseUseCase } from "../../application/use-cases/updateExercise/index.js";

type AuthEnv = { Variables: AuthVariables };

export class ExercisesController {
  constructor(
    private readonly getExercisesUseCase: GetExercisesUseCase,
    private readonly createExerciseUseCase: CreateExerciseUseCase,
    private readonly getExerciseByIdUseCase: GetExerciseByIdUseCase,
    private readonly updateExerciseUseCase: UpdateExerciseUseCase,
    private readonly deleteExerciseUseCase: DeleteExerciseUseCase,
  ) {}

  register(router: OpenAPIHono<AuthEnv>): void {
    router.openapi(listExercisesRoute, async (c) => {
      const { page, size, query } = c.req.valid("query");
      const search = query?.trim() || undefined;

      const result = await this.getExercisesUseCase.execute(c.get("user").id, {
        page,
        size,
        search,
      });

      return c.json({ success: true as const, ...result }, 200);
    });

    router.openapi(createExerciseRoute, async (c) => {
      const body = c.req.valid("json");
      const exercise = await this.createExerciseUseCase.execute(c.get("user").id, {
        name: body.name.trim(),
        parameterSchema: body.parameterSchema,
      });

      return c.json({ success: true as const, data: exercise }, 201);
    });

    router.openapi(getExerciseRoute, async (c) => {
      const { id } = c.req.valid("param");
      const exercise = await this.getExerciseByIdUseCase.execute(c.get("user").id, id);
      return c.json({ success: true as const, data: exercise }, 200);
    });

    router.openapi(updateExerciseRoute, async (c) => {
      const { id } = c.req.valid("param");
      const body = c.req.valid("json");

      if (body.name === undefined && body.parameterSchema === undefined) {
        throw new HTTPException(400, { message: "EMPTY_UPDATE" });
      }

      const exercise = await this.updateExerciseUseCase.execute(c.get("user").id, {
        id,
        name: body.name === undefined ? undefined : body.name.trim(),
        parameterSchema: body.parameterSchema,
      });

      return c.json({ success: true as const, data: exercise }, 200);
    });

    router.openapi(deleteExerciseRoute, async (c) => {
      const { id } = c.req.valid("param");
      await this.deleteExerciseUseCase.execute(c.get("user").id, id);
      return c.json({ success: true as const, data: null }, 200);
    });
  }
}
