import type { ParameterField, ParameterValues } from "~/shared/api/fitnessTypes";

const labels: Record<string, string> = {
  weight_kg: "Вес, кг",
  reps: "Повторения",
};

export function getVisibleParameters(schema: ParameterField[]) {
  return schema.filter((field) => field.key !== "wellbeing_score");
}

export function parameterLabel(field: ParameterField) {
  return (
    labels[field.key] ??
    (field.unit ? (field.label ?? field.key) + ", " + field.unit : (field.label ?? field.key))
  );
}

export function parameterText(field: ParameterField, values: ParameterValues) {
  const value = values[field.key];
  if (value === undefined) return "—";
  return typeof value === "boolean" ? (value ? "Да" : "Нет") : String(value);
}

export function formatDate(value: string) {
  return new Date(value).toLocaleString("ru-RU", { dateStyle: "medium", timeStyle: "short" });
}
