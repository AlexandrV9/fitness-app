import { getUserIdFromContext } from "~/shared/hono/context.js";

import {
  addWorkoutSetRoute,
  finishWorkoutRoute,
  deleteWorkoutSetRoute,
  getActiveWorkoutRoute,
  getWorkoutRoute,
  listWorkoutsRoute,
  saveWorkoutSetRoute,
  skipWorkoutExerciseRoute,
  startWorkoutRoute,
} from "../openapi/workouts.js";

import type { OpenAPIHono } from "@hono/zod-openapi";

import type { AuthVariables } from "~/shared/lib/types.js";

import type { AddSetUseCase } from "../../application/use-cases/addSet/index.js";
import type { DeleteSetUseCase } from "../../application/use-cases/deleteSet/index.js";
import type { FinishWorkoutUseCase } from "../../application/use-cases/finishWorkout/index.js";
import type { GetActiveWorkoutUseCase } from "../../application/use-cases/getActiveWorkout/index.js";
import type { GetWorkoutByIdUseCase } from "../../application/use-cases/getWorkoutById/index.js";
import type { GetWorkoutsUseCase } from "../../application/use-cases/getWorkouts/index.js";
import type { SaveSetUseCase } from "../../application/use-cases/saveSet/index.js";
import type { SkipExerciseUseCase } from "../../application/use-cases/skipExercise/index.js";
import type { StartWorkoutUseCase } from "../../application/use-cases/startWorkout/index.js";

type AuthEnv = { Variables: AuthVariables };

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
    private readonly deleteSetUseCase: DeleteSetUseCase,
  ) {}

  register(router: OpenAPIHono<AuthEnv>): void {
    router.openapi(listWorkoutsRoute, async (c) => {
      const { page, size } = c.req.valid("query");
      const result = await this.getWorkoutsUseCase.execute(getUserIdFromContext(c), {
        page,
        size,
      });
      return c.json({ success: true as const, data: result }, 200);
    });

    router.openapi(getActiveWorkoutRoute, async (c) => {
      const workout = await this.getActiveWorkoutUseCase.execute(getUserIdFromContext(c));
      return c.json({ success: true as const, data: workout }, 200);
    });

    router.openapi(getWorkoutRoute, async (c) => {
      const { id } = c.req.valid("param");
      const workout = await this.getWorkoutByIdUseCase.execute(getUserIdFromContext(c), id);
      return c.json({ success: true as const, data: workout }, 200);
    });

    router.openapi(startWorkoutRoute, async (c) => {
      const { templateId } = c.req.valid("json");
      const { workout, created } = await this.startWorkoutUseCase.execute(
        getUserIdFromContext(c),
        templateId,
      );
      return c.json({ success: true as const, data: workout }, created ? 201 : 200);
    });

    router.openapi(finishWorkoutRoute, async (c) => {
      const { id } = c.req.valid("param");
      const workout = await this.finishWorkoutUseCase.execute(getUserIdFromContext(c), id);
      return c.json({ success: true as const, data: workout }, 200);
    });

    router.openapi(skipWorkoutExerciseRoute, async (c) => {
      const { id, exerciseId } = c.req.valid("param");
      const workout = await this.skipExerciseUseCase.execute(
        getUserIdFromContext(c),
        id,
        exerciseId,
      );
      return c.json({ success: true as const, data: workout }, 200);
    });

    router.openapi(addWorkoutSetRoute, async (c) => {
      const { id, exerciseId } = c.req.valid("param");
      const set = await this.addSetUseCase.execute(getUserIdFromContext(c), id, exerciseId);
      return c.json({ success: true as const, data: set }, 201);
    });

    router.openapi(deleteWorkoutSetRoute, async (c) => {
      const { id, exerciseId, setId } = c.req.valid("param");
      await this.deleteSetUseCase.execute(getUserIdFromContext(c), id, exerciseId, setId);
      return c.json({ success: true as const, data: null }, 200);
    });

    router.openapi(saveWorkoutSetRoute, async (c) => {
      const { id, exerciseId, setId } = c.req.valid("param");
      const body = c.req.valid("json");
      const set = await this.saveSetUseCase.execute(
        getUserIdFromContext(c),
        id,
        exerciseId,
        setId,
        body,
      );
      return c.json({ success: true as const, data: set }, 200);
    });
  }
}
