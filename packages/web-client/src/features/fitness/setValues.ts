import { z } from "zod";

import type { ParameterField, ParameterValues } from "~/shared/api/fitnessTypes";

export type SetDraft = Record<string, string>;

export function createSetDraft(schema: ParameterField[], values: ParameterValues): SetDraft {
  return Object.fromEntries(
    schema.map((field) => [
      field.key,
      Object.hasOwn(values, field.key) ? String(values[field.key]) : "",
    ]),
  );
}

function createFieldSchema(field: ParameterField) {
  const isOptional = field.required === false;

  if (field.type === "number" || field.type === "integer") {
    return z.string().transform((raw, ctx) => {
      if (raw === "") {
        if (!isOptional) {
          ctx.addIssue({ code: "custom", message: "Заполните поле" });
          return z.NEVER;
        }
        return undefined;
      }

      const value = Number(raw);
      if (!Number.isFinite(value) || (field.type === "integer" && !Number.isInteger(value))) {
        ctx.addIssue({
          code: "custom",
          message: field.type === "integer" ? "Введите целое число" : "Введите число",
        });
        return z.NEVER;
      }
      if (field.min !== undefined && value < field.min) {
        ctx.addIssue({ code: "custom", message: "Минимум " + field.min });
        return z.NEVER;
      }
      if (field.max !== undefined && value > field.max) {
        ctx.addIssue({ code: "custom", message: "Максимум " + field.max });
        return z.NEVER;
      }
      return value;
    });
  }

  if (field.type === "boolean") {
    return z.string().transform((raw, ctx) => {
      if (raw === "") {
        if (!isOptional) {
          ctx.addIssue({ code: "custom", message: "Заполните поле" });
          return z.NEVER;
        }
        return undefined;
      }
      if (raw !== "true" && raw !== "false") {
        ctx.addIssue({ code: "custom", message: "Выберите Да или Нет" });
        return z.NEVER;
      }
      return raw === "true";
    });
  }

  return z.string().transform((raw, ctx) => {
    if (raw === "") {
      if (!isOptional) {
        ctx.addIssue({ code: "custom", message: "Заполните поле" });
        return z.NEVER;
      }
      return undefined;
    }
    if (field.minLength !== undefined && raw.length < field.minLength) {
      ctx.addIssue({ code: "custom", message: "Минимум " + field.minLength + " символов" });
      return z.NEVER;
    }
    if (field.maxLength !== undefined && raw.length > field.maxLength) {
      ctx.addIssue({ code: "custom", message: "Максимум " + field.maxLength + " символов" });
      return z.NEVER;
    }
    return raw;
  });
}

export function parseSetDraft(schema: ParameterField[], draft: SetDraft) {
  const values: ParameterValues = Object.create(null);
  const errors: Record<string, string> = Object.create(null);

  for (const field of schema) {
    const result = createFieldSchema(field).safeParse(draft[field.key] ?? "");
    if (!result.success) {
      errors[field.key] = result.error.issues[0]?.message ?? "Некорректное значение";
      continue;
    }
    if (result.data !== undefined) {
      values[field.key] = result.data;
    }
  }

  return { values, errors };
}
