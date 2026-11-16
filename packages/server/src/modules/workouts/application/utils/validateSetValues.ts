import { z } from "zod";

import { isObject } from "../../../../shared/lib/guards.js";
import {
  InvalidWorkoutParameterSchemaException,
  InvalidWorkoutSetValuesException,
} from "../../domain/exceptions/index.js";

import type { SetParameterValues } from "../../domain/interfaces/set/SetDto.js";
import type { WorkoutFieldError, WorkoutFieldErrorCode } from "./types/index.js";


const valueSchemas = {
  number: z.number(),
  string: z.string(),
  boolean: z.boolean(),
};

const baseField = {
  key: z.string().min(1),
  required: z.boolean().optional(),
};
const baseFieldSchema = z.object(baseField);

const numberFieldSchema = z.object({
  ...baseField,
  type: z.literal("integer"),
  min: z.number().optional(),
  max: z.number().optional(),
});

const stringFieldSchema = z.object({
  ...baseField,
  type: z.literal("string"),
  minLength: z.number().optional(),
  maxLength: z.number().optional(),
});

const booleanFieldSchema = z.object({
  ...baseField,
  type: z.literal("boolean"),
});

const fieldSchema = z.discriminatedUnion("type", [
  numberFieldSchema,
  stringFieldSchema,
  booleanFieldSchema,
]);

type Field = z.infer<typeof fieldSchema>;
type SetParameterValue = SetParameterValues[string];

type ParseParameterFieldsResult =
  | { success: true; fields: Field[] }
  | { success: false; errors: WorkoutFieldError[] };

function parseParameterFields(rules: unknown[]): ParseParameterFieldsResult {
  const fields: Field[] = [];
  const fieldKeys = new Set<string>();
  const errors: WorkoutFieldError[] = [];

  for (const rule of rules) {
    const baseParsed = baseFieldSchema.safeParse(rule);

    if (!baseParsed.success) {
      const key = isObject(rule) && typeof rule.key === "string" ? rule.key : "";
      errors.push({ key, code: "INVALID_KEY" });
      continue;
    }

    const key = baseParsed.data.key;

    if (fieldKeys.has(key)) {
      errors.push({ key, code: "DUPLICATE_KEY" });
      continue;
    }

    const parsed = fieldSchema.safeParse(rule);
    if (!parsed.success) {
      errors.push({ key, code: "INVALID_FIELD_CONFIG" });
      continue;
    }

    fieldKeys.add(key);
    fields.push(parsed.data);
  }

  if (errors.length > 0) {
    return { success: false, errors };
  }

  return { success: true, fields };
}

function getValueSchema(field: Field): z.ZodType<SetParameterValue> {
  if (field.type === "boolean") {
    return valueSchemas.boolean;
  }

  if (field.type === "string") {
    let schema = z.string();

    if (field.minLength !== undefined) {
      schema = schema.min(field.minLength);
    }

    if (field.maxLength !== undefined) {
      schema = schema.max(field.maxLength);
    }

    return schema;
  }

  let schema = z.number().int();

  if (field.min !== undefined) {
    schema = schema.min(field.min);
  }

  if (field.max !== undefined) {
    schema = schema.max(field.max);
  }

  return schema;
}

function getValueErrorCode(field: Field, issueCode?: string): WorkoutFieldErrorCode {
  if (issueCode === "too_small" || issueCode === "too_big") {
    return field.type === "string" ? "INVALID_LENGTH" : "OUT_OF_RANGE";
  }
  return "INVALID_TYPE";
}

export function validateSetValues(rules: unknown[], rawValues: unknown): SetParameterValues {
  if (!isObject(rawValues)) {
    throw new InvalidWorkoutSetValuesException([{ key: "", code: "INVALID_TYPE" }]);
  }

  const result = parseParameterFields(rules);
  if (!result.success) {
    throw new InvalidWorkoutParameterSchemaException(result.errors);
  }

  const values: [string, SetParameterValue][] = [];
  const errors: WorkoutFieldError[] = [];

  for (const field of result.fields) {
    const { key } = field;

    // Если нужного ключа нету в rawValues
    if (!Object.hasOwn(rawValues, key)) {
      // А оно было обязательно, то возвращаем ошибку
      if (field.required !== false) {
        errors.push({ key, code: "REQUIRED" });
      }
      continue;
    }

    // Проверям набор других данных на корректность
    const parsed = getValueSchema(field).safeParse(rawValues[key]);

    if (!parsed.success) {
      errors.push({
        key,
        code: getValueErrorCode(field, parsed.error.issues[0]?.code),
      });
      continue;
    }

    values.push([key, parsed.data]);
  }

  const fieldKeys = new Set(result.fields.map((field) => field.key));

  for (const key of Object.keys(rawValues)) {
    // Если среди переданных ключей есть те, которые не указаны в правилах, то выкидываем исключение
    if (!fieldKeys.has(key)) {
      errors.push({ key, code: "UNEXPECTED_KEY" });
    }
  }

  // Если есть ошибки — кидаем исключение со всеми сразу
  if (errors.length > 0) {
    throw new InvalidWorkoutSetValuesException(errors);
  }

  // 6. Возвращаем очищенные и провалидированные значения
  return Object.fromEntries(values);
}
