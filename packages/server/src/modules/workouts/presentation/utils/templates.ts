import { HTTPException } from "hono/http-exception";
import { z } from "zod";

import { readRequestBody } from "~/shared/hono/context.js";
import { isUuid } from "~/shared/lib/guards.js";

import type { Context } from "hono";

import type { SetResultInput } from "../../domain/interfaces/set/SetDto.js";
import type { WorkoutTemplateInputDto } from "../../domain/interfaces/template/TemplateDto.js";
import type { TemplateExerciseInputDto } from "../../domain/interfaces/template/TemplateExerciseDto.js";

export const templateExerciseSchema = z.object({
  exerciseId: z.uuid(),
  plannedSets: z.number().int().min(1).max(100).nullable().optional().default(null),
});

const templateExercisesSchema = z
  .array(templateExerciseSchema)
  .min(1, "At least one exercise is required")
  .max(100, "Too many exercises");

const templateUpdateSchema = z
  .object({
    name: z.string().min(1).max(100).optional(),
    exercises: templateExercisesSchema.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, { message: "EMPTY_UPDATE" });

function readUuid(value: unknown, errorMessage = "INVALID_ID"): string {
  if (typeof value !== "string" || !isUuid(value)) {
    throw new HTTPException(400, { message: errorMessage });
  }
  return value;
}

function readTemplateName(value: unknown) {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new HTTPException(400, { message: "INVALID_NAME" });
  }
  return value.trim();
}

export async function getTemplateIdFromBody(c: Context): Promise<string> {
  const body = await readRequestBody(c);
  return readUuid(body.templateId, "INVALID_TEMPLATE_ID");
}

export async function readTemplateUpdate(c: Context): Promise<Partial<WorkoutTemplateInputDto>> {
  const body = await readRequestBody(c);
  const result = templateUpdateSchema.safeParse(body);

  if (!result.success) {
    throw new HTTPException(400, {
      message: result.error.issues[0]?.message || "INVALID_UPDATE",
    });
  }

  return result.data;
}

export function readTemplateExercises(value: unknown): TemplateExerciseInputDto[] {
  const result = templateExercisesSchema.safeParse(value);

  if (!result.success) {
    const firstError = result.error.issues[0];

    throw new HTTPException(400, {
      message: firstError?.message || "INVALID_TEMPLATE_EXERCISES",
    });
  }

  return result.data;
}

export async function readNewTemplate(c: Context): Promise<WorkoutTemplateInputDto> {
  const body = await readRequestBody(c);
  return { name: readTemplateName(body.name), exercises: readTemplateExercises(body.exercises) };
}

const setResultSchema = z.discriminatedUnion("status", [
  z.object({
    status: z.literal("skipped"),
  }),
  z.object({
    status: z.literal("completed"),
    // Здесь должна быть схема ваших parameterValues.
    // Если это Record<string, string | number | boolean>, то:
    parameterValues: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])),
  }),
]);

export async function readSetResult(c: Context): Promise<SetResultInput> {
  const body = await readRequestBody(c);
  const result = setResultSchema.safeParse(body);

  if (!result.success) {
    throw new HTTPException(400, { message: "INVALID_SET_RESULT" });
  }

  return result.data;
}
