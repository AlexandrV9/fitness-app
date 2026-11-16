import {
  getPaginationParamsFromContext,
  getUserIdFromContext,
  getUuidParamFromContext,
} from "../../../shared/hono/context.js";
import { readNewTemplate, readTemplateUpdate } from "./utils/templates.js";

import type { AuthVariables } from "../../auth/presentation/createAuthMiddleware.js";
import type { CreateWorkoutTemplateUseCase } from "../application/use-cases/createWorkoutTemplate/index.js";
import type { DeleteWorkoutTemplateUseCase } from "../application/use-cases/deleteWorkoutTemplate/index.js";
import type { GetWorkoutTemplateUseCase } from "../application/use-cases/getWorkoutTemplate/index.js";
import type { GetWorkoutTemplatesUseCase } from "../application/use-cases/getWorkoutTemplates/index.js";
import type { UpdateWorkoutTemplateUseCase } from "../application/use-cases/updateWorkoutTemplate/index.js";
import type { Hono } from "hono";

export class WorkoutTemplatesController {
  constructor(
    private readonly getWorkoutTemplatesUseCase: GetWorkoutTemplatesUseCase,
    private readonly getWorkoutTemplateUseCase: GetWorkoutTemplateUseCase,
    private readonly createWorkoutTemplateUseCase: CreateWorkoutTemplateUseCase,
    private readonly updateWorkoutTemplateUseCase: UpdateWorkoutTemplateUseCase,
    private readonly deleteWorkoutTemplateUseCase: DeleteWorkoutTemplateUseCase,
  ) {}

  register(router: Hono<{ Variables: AuthVariables }>): void {
    router.get("/", async (c) => {
      const result = await this.getWorkoutTemplatesUseCase.execute(
        getUserIdFromContext(c),
        getPaginationParamsFromContext(c),
      );
      return c.json({ success: true, ...result });
    });

    router.post("/", async (c) => {
      const template = await this.createWorkoutTemplateUseCase.execute(
        getUserIdFromContext(c),
        await readNewTemplate(c),
      );
      return c.json({ success: true, data: template }, 201);
    });

    router.get("/:id", async (c) => {
      const template = await this.getWorkoutTemplateUseCase.execute(
        getUserIdFromContext(c),
        getUuidParamFromContext(c, "id"),
      );
      return c.json({ success: true, data: template });
    });

    router.patch("/:id", async (c) => {
      const template = await this.updateWorkoutTemplateUseCase.execute(
        getUserIdFromContext(c),
        getUuidParamFromContext(c, "id"),
        await readTemplateUpdate(c),
      );
      return c.json({ success: true, data: template });
    });

    router.delete("/:id", async (c) => {
      await this.deleteWorkoutTemplateUseCase.execute(
        getUserIdFromContext(c),
        getUuidParamFromContext(c, "id"),
      );
      return c.json({ success: true, data: null });
    });
  }
}
