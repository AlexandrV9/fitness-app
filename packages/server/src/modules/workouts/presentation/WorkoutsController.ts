import {
  getPaginationParamsFromContext,
  getUserIdFromContext,
  getUuidParamFromContext,
} from "../../../shared/hono/context.js";
import { getTemplateIdFromBody, readSetResult } from "./utils/templates.js";

import type { AuthVariables } from "../../auth/presentation/createAuthMiddleware.js";
import type { AddSetUseCase } from "../application/use-cases/addSet/index.js";
import type { FinishWorkoutUseCase } from "../application/use-cases/finishWorkout/index.js";
import type { GetActiveWorkoutUseCase } from "../application/use-cases/getActiveWorkout/index.js";
import type { GetWorkoutByIdUseCase } from "../application/use-cases/getWorkoutById/index.js";
import type { GetWorkoutsUseCase } from "../application/use-cases/getWorkouts/index.js";
import type { SaveSetUseCase } from "../application/use-cases/saveSet/index.js";
import type { SkipExerciseUseCase } from "../application/use-cases/skipExercise/index.js";
import type { StartWorkoutUseCase } from "../application/use-cases/startWorkout/index.js";
import type { Hono } from "hono";

export class WorkoutsController {
  constructor(
    private readonly getWorkoutsUseCase: GetWorkoutsUseCase,
    private readonly getActiveWorkoutUseCase: GetActiveWorkoutUseCase,
    private readonly getWorkoutByIdUseCase: GetWorkoutByIdUseCase,
    private readonly startWorkoutUseCase: StartWorkoutUseCase,
    private readonly finishWorkoutUseCase: FinishWorkoutUseCase,
    private readonly skipExerciseUseCase: SkipExerciseUseCase,
    private readonly addSetUseCase: AddSetUseCase,
    private readonly saveSetUseCase: SaveSetUseCase,
  ) {}

  register(router: Hono<{ Variables: AuthVariables }>): void {
    router.get("/", async (c) => {
      const result = await this.getWorkoutsUseCase.execute(
        getUserIdFromContext(c),
        getPaginationParamsFromContext(c),
      );
      return c.json({ success: true, data: result });
    });

    router.get("/active", async (c) => {
      const workout = await this.getActiveWorkoutUseCase.execute(getUserIdFromContext(c));
      return c.json({ success: true, data: workout });
    });

    router.get("/:id", async (c) => {
      const workout = await this.getWorkoutByIdUseCase.execute(
        getUserIdFromContext(c),
        getUuidParamFromContext(c, "id"),
      );
      return c.json({ success: true, data: workout });
    });

    router.post("/", async (c) => {
      const { workout, created } = await this.startWorkoutUseCase.execute(
        getUserIdFromContext(c),
        await getTemplateIdFromBody(c),
      );
      return c.json({ success: true, data: workout }, created ? 201 : 200);
    });

    router.post("/:id/finish", async (c) => {
      const workout = await this.finishWorkoutUseCase.execute(
        getUserIdFromContext(c),
        getUuidParamFromContext(c, "id"),
      );
      return c.json({ success: true, data: workout });
    });

    router.post("/:id/exercises/:exerciseId/skip", async (c) => {
      const workout = await this.skipExerciseUseCase.execute(
        getUserIdFromContext(c),
        getUuidParamFromContext(c, "id"),
        getUuidParamFromContext(c, "exerciseId"),
      );
      return c.json({ success: true, data: workout });
    });

    router.post("/:id/exercises/:exerciseId/sets", async (c) => {
      const set = await this.addSetUseCase.execute(
        getUserIdFromContext(c),
        getUuidParamFromContext(c, "id"),
        getUuidParamFromContext(c, "exerciseId"),
      );
      return c.json({ success: true, data: set }, 201);
    });

    router.patch("/:id/exercises/:exerciseId/sets/:setId", async (c) => {
      const set = await this.saveSetUseCase.execute(
        getUserIdFromContext(c),
        getUuidParamFromContext(c, "id"),
        getUuidParamFromContext(c, "exerciseId"),
        getUuidParamFromContext(c, "setId"),
        await readSetResult(c),
      );
      return c.json({ success: true, data: set });
    });
  }
}
