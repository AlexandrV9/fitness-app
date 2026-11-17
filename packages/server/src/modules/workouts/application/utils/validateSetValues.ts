import { z } from "zod";

import { isObject } from "~/shared/lib/guards.js";
import { parseParameterFields } from "~/shared/lib/parameterSchema.js";
import {
  InvalidWorkoutParameterSchemaException,
  InvalidWorkoutSetValuesException,
} from "../../domain/exceptions/index.js";

import type { ParameterField } from "~/shared/lib/parameterSchema.js";
import type { SetParameterValues } from "../../domain/interfaces/set/SetDto.js";
import type { WorkoutFieldError, WorkoutFieldErrorCode } from "./types/index.js";

type SetParameterValue = SetParameterValues[string];

function getValueSchema(field: ParameterField): z.ZodType<SetParameterValue> {
  if (field.type === "boolean") {
    return z.boolean();
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

  let schema = field.type === "integer" ? z.number().int() : z.number();

  if (field.min !== undefined) {
    schema = schema.min(field.min);
  }

  if (field.max !== undefined) {
    schema = schema.max(field.max);
  }

  return schema;
}

function getValueErrorCode(field: ParameterField, issueCode?: string): WorkoutFieldErrorCode {
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
      if (field.required ?? key !== "wellbeing_score") {
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
