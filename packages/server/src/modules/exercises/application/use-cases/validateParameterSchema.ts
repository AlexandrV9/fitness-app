import { parseParameterFields } from "~/shared/lib/parameterSchema.js";

import { ExerciseInvalidParameterSchemaException } from "../../domain/exceptions/index.js";

export const defaultParameterSchema = [
  { key: "weight_kg", label: "Вес", type: "number", min: 0, unit: "kg" },
  { key: "reps", label: "Повторения", type: "integer", min: 1 },
  {
    key: "wellbeing_score",
    label: "Самочувствие",
    type: "integer",
    min: 1,
    max: 10,
    required: false,
  },
];

export function validateParameterSchema(schema: unknown): unknown[] {
  if (!Array.isArray(schema) || !parseParameterFields(schema).success) {
    throw new ExerciseInvalidParameterSchemaException();
  }

  return schema;
}
