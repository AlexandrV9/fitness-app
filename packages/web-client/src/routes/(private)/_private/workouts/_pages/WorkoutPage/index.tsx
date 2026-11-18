import { useIsMutating, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useState } from "react";

import { WorkoutSetForm } from "~/features/fitness/components/WorkoutSetForm";
import { formatDate, parameterLabel, parameterText } from "~/features/fitness/parameters";
import { workoutQueries } from "~/features/fitness/queries";
import { workoutsService } from "~/shared/api/fitnessService";
import type { WorkoutDetail, WorkoutExercise, WorkoutSet } from "~/shared/api/fitnessTypes";
import { useUnsavedChanges } from "~/shared/hooks/useUnsavedChanges";
import { Button, Card, Flex, Page, QueryFeedback, Typography } from "~/shared/ui";

const statuses = { pending: "Не выполнен", completed: "Выполнен", skipped: "Пропущен" };

export function WorkoutPage({ id }: { id: string }) {
  const queryClient = useQueryClient();

  const [dirtySets, setDirtySets] = useState<Set<string>>(() => new Set());

  const workout = useQuery({ ...workoutQueries.detail(id), refetchOnWindowFocus: false });

  const busy = useIsMutating({ mutationKey: ["workout-write", id] }) > 0;

  function onDirty(setId: string, dirty: boolean) {
    setDirtySets((previous) => {
      const next = new Set(previous);
      if (dirty) next.add(setId);
      else next.delete(setId);
      return next;
    });
  }

  const finish = useMutation({
    mutationKey: ["workout-write", id],
    mutationFn: () => workoutsService.finish(id),
    onSuccess: async (finished) => {
      setDirtySets(new Set());
      queryClient.setQueryData(workoutQueries.detail(id).queryKey, finished);
      queryClient.setQueryData(workoutQueries.active().queryKey, null);
      await queryClient.invalidateQueries({ queryKey: ["workouts", "list"] });
    },
  });

  const addSet = useMutation({
    mutationKey: ["workout-write", id],
    mutationFn: (exerciseId: string) => workoutsService.addSet(id, exerciseId),
    onSuccess: (set, exerciseId) => {
      queryClient.setQueryData<WorkoutDetail>(
        workoutQueries.detail(id).queryKey,
        (current) =>
          current && {
            ...current,
            exercises: current.exercises.map((exercise) =>
              exercise.id === exerciseId
                ? { ...exercise, sets: [...exercise.sets, set] }
                : exercise
            ),
          }
      );
    },
  });

  const skip = useMutation({
    mutationKey: ["workout-write", id],
    mutationFn: (exerciseId: string) => workoutsService.skipExercise(id, exerciseId),
    onSuccess: (updated, exerciseId) => {
      queryClient.setQueryData(workoutQueries.detail(id).queryKey, updated);
      for (const set of updated.exercises.find((exercise) => exercise.id === exerciseId)?.sets ??
        []) {
        onDirty(set.id, false);
      }
    },
  });
  useUnsavedChanges((dirtySets.size > 0 || busy) && !finish.isSuccess);

  const data = workout.data;
  return (
    <Page title={data?.templateName ?? "Тренировка"}>
      <QueryFeedback {...workout} onRetry={() => void workout.refetch()} />
      {data && (
        <>
          <Typography>Начата {formatDate(data.startedAt)}</Typography>
          {data.finishedAt && (
            <Typography as="output">Завершена {formatDate(data.finishedAt)}</Typography>
          )}
          {[...data.exercises]
            .sort((a, b) => a.position - b.position)
            .map((exercise) => (
              <Card key={exercise.id} title={exercise.name}>
                {exercise.isSkipped && <Typography>Упражнение пропущено</Typography>}
                {[...exercise.sets]
                  .sort((a, b) => a.setNumber - b.setNumber)
                  .map((set) => (
                    <Card key={set.id}>
                      <Typography variant="h_3">
                        Подход {set.setNumber} — {statuses[set.status]}
                      </Typography>
                      {data.finishedAt || exercise.isSkipped ? (
                        <SetResult set={set} exercise={exercise} />
                      ) : (
                        <details open={set.status === "pending"}>
                          <summary>
                            {set.status === "pending"
                              ? "Заполнить результат"
                              : "Посмотреть и изменить результат"}
                          </summary>
                          <div style={{ paddingTop: 16 }}>
                            <WorkoutSetForm
                              workoutId={id}
                              exercise={exercise}
                              set={set}
                              disabled={busy}
                              onDirty={onDirty}
                            />
                          </div>
                        </details>
                      )}
                    </Card>
                  ))}
                {!data.finishedAt && !exercise.isSkipped && (
                  <Flex wrap="wrap" columnGap={12} rowGap={8}>
                    <Button
                      size="m"
                      variant="outline"
                      disabled={busy}
                      onClick={() => addSet.mutate(exercise.id)}
                    >
                      Добавить подход
                    </Button>
                    <Button
                      size="m"
                      variant="outline"
                      disabled={busy}
                      onClick={() => {
                        if (
                          window.confirm(
                            "Пропустить упражнение «" +
                              exercise.name +
                              "»? Сохранённые результаты останутся в истории."
                          )
                        ) {
                          skip.mutate(exercise.id);
                        }
                      }}
                    >
                      Пропустить упражнение
                    </Button>
                  </Flex>
                )}
              </Card>
            ))}
          {!data.finishedAt && (
            <Button
              disabled={busy}
              onClick={() => {
                const message =
                  dirtySets.size > 0
                    ? "Есть несохранённые результаты. Завершить тренировку? Незавершённые подходы будут пропущены."
                    : "Завершить тренировку? Незавершённые подходы будут пропущены.";
                if (window.confirm(message)) finish.mutate();
              }}
            >
              {finish.isPending ? "Завершение…" : "Завершить тренировку"}
            </Button>
          )}
          <Link to="/workouts">История тренировок</Link>
        </>
      )}
    </Page>
  );
}

function SetResult({ set, exercise }: { set: WorkoutSet; exercise: WorkoutExercise }) {
  if (set.status !== "completed") return null;
  return (
    <Flex direction="column" rowGap={6}>
      {exercise.parameterSchema.map((field) => (
        <Typography key={field.key}>
          {parameterLabel(field)} — {parameterText(field, set.parameterValues)}
        </Typography>
      ))}
    </Flex>
  );
}
