import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { workoutsService } from "~/shared/api/fitnessService";
import { Button, Flex, Select, TextInput, Typography } from "~/shared/ui";

import { parameterLabel } from "../parameters";
import { workoutQueries } from "../queries";

import type {
  ParameterValues,
  SetInput,
  WorkoutDetail,
  WorkoutExercise,
  WorkoutSet,
} from "~/shared/api/fitnessTypes";

type Props = {
  workoutId: string;
  exercise: WorkoutExercise;
  set: WorkoutSet;
  disabled: boolean;
  onDirty: (setId: string, dirty: boolean) => void;
};

export function WorkoutSetForm({ workoutId, exercise, set, disabled, onDirty }: Props) {
  const queryClient = useQueryClient();
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      exercise.parameterSchema.map((field) => [
        field.key,
        String(set.parameterValues[field.key] ?? ""),
      ]),
    ),
  );
  const save = useMutation({
    mutationKey: ["workout-write", workoutId],
    mutationFn: (input: SetInput) => workoutsService.saveSet(workoutId, exercise.id, set.id, input),
    onSuccess: (saved) => {
      queryClient.setQueryData<WorkoutDetail>(
        workoutQueries.detail(workoutId).queryKey,
        (workout) =>
          workout && {
            ...workout,
            exercises: workout.exercises.map((item) =>
              item.id === exercise.id
                ? {
                    ...item,
                    sets: item.sets.map((current) => (current.id === saved.id ? saved : current)),
                  }
                : item,
            ),
          },
      );
      setValues(
        Object.fromEntries(
          exercise.parameterSchema.map((field) => [
            field.key,
            String(saved.parameterValues[field.key] ?? ""),
          ]),
        ),
      );
      onDirty(set.id, false);
    },
  });

  function submit() {
    const parameterValues: ParameterValues = {};
    for (const field of exercise.parameterSchema) {
      const value = values[field.key];
      if (value === undefined || value === "") continue;
      switch (field.type) {
        case "number":
        case "integer":
          parameterValues[field.key] = Number(value);
          break;
        case "boolean":
          parameterValues[field.key] = value === "true";
          break;
        default:
          parameterValues[field.key] = value;
      }
    }
    save.mutate({ status: "completed", parameterValues });
  }

  function change(key: string, value: string) {
    save.reset();
    setValues((previous) => ({ ...previous, [key]: value }));
    onDirty(set.id, true);
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
    >
      <fieldset
        disabled={disabled || save.isPending}
        style={{ border: 0, padding: 0, margin: 0, minWidth: 0 }}
      >
        <Flex direction="column" rowGap={16}>
          {exercise.parameterSchema.map((field) =>
            field.type === "boolean" ? (
              <Select
                key={field.key}
                label={parameterLabel(field)}
                value={values[field.key] ?? ""}
                required={field.required !== false}
                onChange={(event) => change(field.key, event.target.value)}
              >
                <option value="">Не заполнено</option>
                <option value="true">Да</option>
                <option value="false">Нет</option>
              </Select>
            ) : (
              <TextInput
                key={field.key}
                label={parameterLabel(field)}
                name={field.key}
                fullWidth
                type={field.type === "number" || field.type === "integer" ? "number" : "text"}
                inputMode={
                  field.type === "integer"
                    ? "numeric"
                    : field.type === "number"
                      ? "decimal"
                      : undefined
                }
                step={field.type === "integer" ? 1 : "any"}
                min={field.min}
                max={field.max}
                minLength={field.minLength}
                maxLength={field.maxLength}
                required={field.required !== false}
                value={values[field.key] ?? ""}
                hintMessage={field.required === false ? "Необязательно" : undefined}
                onChange={(event) => change(field.key, event.target.value)}
              />
            ),
          )}
          <Flex columnGap={8} rowGap={8} wrap="wrap">
            <Button type="submit" size="m" disabled={disabled || save.isPending}>
              {save.isPending ? "Сохранение…" : "Готово"}
            </Button>
            <Button
              type="button"
              size="m"
              variant="outline"
              disabled={disabled || save.isPending}
              onClick={() => {
                if (
                  set.status !== "completed" ||
                  window.confirm("Пропустить подход и удалить его результат?")
                ) {
                  save.mutate({ status: "skipped" });
                }
              }}
            >
              Пропустить подход
            </Button>
          </Flex>
          {save.isSuccess && <Typography as="output">Сохранено</Typography>}
        </Flex>
      </fieldset>
    </form>
  );
}
