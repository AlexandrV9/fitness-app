import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo, useRef, useState } from "react";

import { WORKOUT_DETAILS_QUERY_KEY } from "~/features/fitness/queries";
import { createSetDraft, parseSetDraft } from "~/features/fitness/setValues";
import { workoutsService } from "~/shared/api/fitnessService";
import { Card, Flex, IconButton } from "~/shared/ui";
import { CheckIcon, CloseIcon, PencilIcon, TrashIcon } from "~/shared/ui/icons";
import { toast } from "~/shared/ui/Toast";

import { WORKOUT_WRITE_MUTATION_KEY } from "../../constants";
import { WorkoutSetField } from "./WorkoutSetField";

import type { SetDraft } from "~/features/fitness/setValues";
import type { ParameterField, SetInput, WorkoutSet } from "~/shared/api/fitnessTypes";

type WorkoutSetItemProps = {
  set: WorkoutSet;
  schema: ParameterField[];
  workoutId: string;
  exerciseId: string;
  finished: boolean;
  disabled: boolean;
  showIncompleteErrors?: boolean;
  onRemoveSet: (setId: string) => Promise<void>;
};

export function WorkoutSetItem({
  set,
  schema,
  workoutId,
  exerciseId,
  finished,
  disabled,
  showIncompleteErrors = false,
  onRemoveSet,
}: WorkoutSetItemProps) {
  const queryClient = useQueryClient();

  const [draft, setDraft] = useState(() => createSetDraft(schema, set.parameterValues));
  const [dirty, setDirty] = useState(false);
  const [editing, setEditing] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const baseline = useRef<SetDraft>(createSetDraft(schema, set.parameterValues));

  const version = useRef(0);
  const submitted = useRef<number | null>(null);

  const partial = useMemo(() => schema.map((field) => ({ ...field, required: false })), [schema]);
  const parsed = useMemo(() => parseSetDraft(partial, draft), [partial, draft]);
  const complete = useMemo(() => parseSetDraft(schema, draft), [schema, draft]);
  const fieldErrors =
    showIncompleteErrors && set.status === "pending" ? complete.errors : parsed.errors;

  const refresh = () =>
    queryClient.invalidateQueries({ queryKey: [WORKOUT_DETAILS_QUERY_KEY, workoutId] });

  const save = useMutation({
    mutationKey: [WORKOUT_WRITE_MUTATION_KEY, workoutId],
    scope: { id: workoutId },
    mutationFn: ({ input }: { input: SetInput; version: number }) =>
      workoutsService.saveSet(workoutId, exerciseId, set.id, input),
    onSuccess: async (_, snapshot) => {
      await refresh();
      if (snapshot.version !== version.current) return;

      setDirty(false);
      toast.success("Данные подхода сохранены");
      if (!finished) return;

      setEditing(false);
      if (snapshot.input.status !== "skipped") {
        baseline.current = createSetDraft(schema, snapshot.input.parameterValues);
      }
    },
    onError: (_, snapshot) => {
      if (submitted.current === snapshot.version) submitted.current = null;
    },
  });

  const fieldsLocked = finished && !editing;
  const busy = disabled || isRemoving || save.isPending;
  const fieldsDisabled = busy || fieldsLocked;

  function startEdit() {
    baseline.current = draft;
    setEditing(true);
  }

  function cancelEdit() {
    setDraft(baseline.current);
    setDirty(false);
    setEditing(false);
    version.current += 1;
    submitted.current = null;
  }

  function saveDraft() {
    if (
      !dirty ||
      fieldsLocked ||
      busy ||
      Object.keys(parsed.errors).length ||
      submitted.current === version.current
    ) {
      return;
    }

    const next = parseSetDraft(schema, draft);
    submitted.current = version.current;
    save.mutate({
      version: version.current,
      input: {
        status: Object.keys(next.errors).length ? "pending" : "completed",
        parameterValues: parsed.values,
      },
    });
  }

  return (
    <Card as="li">
      <Card.Header>
        <Card.Title>Подход {set.setNumber}</Card.Title>
        <Flex align="center" columnGap={12}>
          {finished && editing ? (
            <>
              <IconButton
                size="m"
                variant="outline"
                color="alert"
                disabled={busy}
                aria-label={"Отменить изменения подхода " + set.setNumber}
                onClick={cancelEdit}
              >
                <CloseIcon />
              </IconButton>
              <IconButton
                size="m"
                variant="default"
                color="primary"
                disabled={busy || !dirty || Object.keys(parsed.errors).length > 0}
                aria-label={"Сохранить подход " + set.setNumber}
                onClick={saveDraft}
              >
                <CheckIcon />
              </IconButton>
            </>
          ) : (
            <>
              <IconButton
                size="m"
                variant="outline"
                color="alert"
                disabled={busy}
                aria-label={"Удалить подход " + set.setNumber}
                onClick={() => {
                  setIsRemoving(true);
                  onRemoveSet(set.id).finally(() => setIsRemoving(false));
                }}
              >
                <TrashIcon />
              </IconButton>
              {finished ? (
                <IconButton
                  size="m"
                  variant="outline"
                  color="primary"
                  disabled={busy}
                  aria-label={"Редактировать подход " + set.setNumber}
                  onClick={startEdit}
                >
                  <PencilIcon />
                </IconButton>
              ) : (
                <IconButton
                  size="m"
                  variant="default"
                  color="primary"
                  disabled={busy || !dirty || Object.keys(parsed.errors).length > 0}
                  aria-label={"Сохранить подход " + set.setNumber}
                  onClick={saveDraft}
                >
                  <CheckIcon />
                </IconButton>
              )}
            </>
          )}
        </Flex>
      </Card.Header>
      <Card.Body>
        <Flex direction="column" rowGap={8} justify="start" align="normal" isFullWidth>
          {schema.map((field) => (
            <WorkoutSetField
              key={field.key}
              field={field}
              value={draft[field.key] ?? ""}
              error={fieldErrors[field.key]}
              disabled={fieldsDisabled}
              onChange={(value) => {
                version.current += 1;
                setDraft((previous) => ({ ...previous, [field.key]: value }));
                setDirty(true);
              }}
            />
          ))}
        </Flex>
      </Card.Body>
    </Card>
  );
}
