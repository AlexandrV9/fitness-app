import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";

import type { AuthVariables } from "../../auth/presentation/createAuthMiddleware.js";
import type { CreateExerciseUseCase } from "../application/use-cases/createExercise/index.js";
import type { DeleteExerciseUseCase } from "../application/use-cases/deleteExercise/index.js";
import type { GetExerciseByIdUseCase } from "../application/use-cases/getExerciseById/index.js";
import type { UpdateExerciseUseCase } from "../application/use-cases/updateExercise/index.js";
import type { Context } from "hono";
import type { BlankSchema } from "hono/types";

type AuthData = {
  Variables: AuthVariables;
};

type Router = Hono<AuthData, BlankSchema, "/">;

/**
 * HTTP-контроллер упражнений.
 */
export class ExercisesController {
  constructor(
    private readonly createExerciseUseCase: CreateExerciseUseCase,
    private readonly getExerciseByIdUseCase: GetExerciseByIdUseCase,
    private readonly updateExerciseUseCase: UpdateExerciseUseCase,
    private readonly deleteExerciseUseCase: DeleteExerciseUseCase,
  ) {}

  register(router: Router): void {
    router.post("/", this.handleCreateExercise);
    router.get("/:id", this.handleGetExerciseById);
    router.patch("/:id", this.handleUpdateExercise);
    router.delete("/:id", this.handleDeleteExercise);
  }

  private handleCreateExercise = async (c: Context<AuthData>) => {
    const body = await c.req.json();
    const name = body?.name;
    const parameterSchema = body?.parameterSchema;

    if (typeof name !== "string" || name.trim().length === 0) {
      throw new HTTPException(400, { message: "INVALID_NAME" });
    }

    const exercise = await this.createExerciseUseCase.execute(c.get("user").id, {
      name: name.trim(),
      parameterSchema,
    });

    return c.json({ success: true, data: exercise }, 201);
  };

  private handleGetExerciseById = async (c: Context<AuthData>) => {
    const exercise = await this.getExerciseByIdUseCase.execute(
      c.get("user").id,
      this.getExerciseId(c),
    );

    return c.json({ success: true, data: exercise });
  };

  private handleUpdateExercise = async (c: Context<AuthData>) => {
    const body = await c.req.json();
    const name = body?.name;
    const parameterSchema = body?.parameterSchema;

    if (name !== undefined && (typeof name !== "string" || name.trim().length === 0)) {
      throw new HTTPException(400, { message: "INVALID_NAME" });
    }

    if (name === undefined && parameterSchema === undefined) {
      throw new HTTPException(400, { message: "EMPTY_UPDATE" });
    }

    const exercise = await this.updateExerciseUseCase.execute(c.get("user").id, {
      id: this.getExerciseId(c),
      name: name === undefined ? undefined : name.trim(),
      parameterSchema,
    });

    return c.json({ success: true, data: exercise });
  };

  private handleDeleteExercise = async (c: Context<AuthData>) => {
    await this.deleteExerciseUseCase.execute(c.get("user").id, this.getExerciseId(c));

    return c.json({ success: true, data: null });
  };

  private getExerciseId(c: Context<AuthData>): string {
    const id = c.req.param("id");
    if (!id) {
      throw new HTTPException(400, { message: "INVALID_EXERCISE_ID" });
    }
    return id;
  }
}
