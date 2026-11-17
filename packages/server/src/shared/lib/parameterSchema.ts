import { z } from "zod";

import { isObject } from "./guards.js";

const baseField = {
  key: z.string().min(1),
  required: z.boolean().optional(),
};
const baseFieldSchema = z.object(baseField);

const numericBounds = { min: z.number().optional(), max: z.number().optional() };

function boundsInOrder(min?: number, max?: number): boolean {
  return min === undefined || max === undefined || min <= max;
}

const fieldSchema = z.discriminatedUnion("type", [
  z
    .object({ ...baseField, type: z.literal("integer"), ...numericBounds })
    .refine(({ min, max }) => boundsInOrder(min, max)),
  z
    .object({ ...baseField, type: z.literal("number"), ...numericBounds })
    .refine(({ min, max }) => boundsInOrder(min, max)),
  z
    .object({
      ...baseField,
      type: z.literal("string"),
      minLength: z.number().int().nonnegative().optional(),
      maxLength: z.number().int().nonnegative().optional(),
    })
    .refine(({ minLength, maxLength }) => boundsInOrder(minLength, maxLength)),
  z.object({ ...baseField, type: z.literal("boolean") }),
]);

export type ParameterField = z.infer<typeof fieldSchema>;

type ParameterSchemaError = {
  key: string;
  code: "INVALID_KEY" | "DUPLICATE_KEY" | "INVALID_FIELD_CONFIG";
};

type ParseParameterFieldsResult =
  | { success: true; fields: ParameterField[] }
  | { success: false; errors: ParameterSchemaError[] };

export function parseParameterFields(rules: unknown[]): ParseParameterFieldsResult {
  const fields: ParameterField[] = [];
  const fieldKeys = new Set<string>();
  const errors: ParameterSchemaError[] = [];

  for (const rule of rules) {
    const base = baseFieldSchema.safeParse(rule);

    if (!base.success) {
      const key = isObject(rule) && typeof rule.key === "string" ? rule.key : "";
      errors.push({ key, code: "INVALID_KEY" });
      continue;
    }

    const { key } = base.data;
    if (fieldKeys.has(key)) {
      errors.push({ key, code: "DUPLICATE_KEY" });
      continue;
    }

    const normalized = isObject(rule) && rule.type === "text" ? { ...rule, type: "string" } : rule;
    const parsed = fieldSchema.safeParse(normalized);
    if (!parsed.success) {
      errors.push({ key, code: "INVALID_FIELD_CONFIG" });
      continue;
    }

    fieldKeys.add(key);
    fields.push(parsed.data);
  }

  return errors.length > 0 ? { success: false, errors } : { success: true, fields };
}
