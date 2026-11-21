import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { formatDate } from "~/features/fitness/parameters";
import {
  ACTIVE_WORKOUT_QUERY_KEY,
  WORKOUT_DETAILS_QUERY_KEY,
  workoutDetailsQueryOptions,
  WORKOUTS_QUERY_KEY,
} from "~/features/fitness/queries";
import { workoutsService } from "~/shared/api/fitnessService";
import { queryClient } from "~/shared/config";
import { Button, PageContent, Typography } from "~/shared/ui";
import { toast } from "~/shared/ui/Toast";

import { WorkoutExerciseList } from "./WorkoutExerciseList";

import type { WorkoutExercise } from "~/shared/api/fitnessTypes";

export type WorkoutPageProps = {
  workoutId: string;
};

function hasUnfilledSets(exercises: WorkoutExercise[]) {
  return exercises.some(
    (exercise) =>
      !exercise.isSkipped && exercise.sets.some((set) => set.status === "pending"),
  );
}

export function WorkoutPage({ workoutId }: WorkoutPageProps) {
  const { data: workout } = useQuery(workoutDetailsQueryOptions(workoutId));
  const [showIncompleteErrors, setShowIncompleteErrors] = useState(false);

  const { mutate: finishWorkout, isPending } = useMutation({
    mutationFn: () => workoutsService.finish(workoutId),
    onSuccess: async () => {
      setShowIncompleteErrors(false);
      toast.success("Тренировка успешно завершена");
      await queryClient.invalidateQueries({ queryKey: [WORKOUT_DETAILS_QUERY_KEY] });
      await queryClient.invalidateQueries({ queryKey: [ACTIVE_WORKOUT_QUERY_KEY] });
      await queryClient.invalidateQueries({ queryKey: [WORKOUTS_QUERY_KEY] });
    },
  });

  const { mutateAsync: addWorkoutSet } = useMutation({
    mutationFn: (exerciseId: string) => workoutsService.addSet(workoutId, exerciseId),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: [WORKOUT_DETAILS_QUERY_KEY] });
    },
  });

  const { mutateAsync: removeWorkoutSet } = useMutation({
    mutationFn: ({ exerciseId, setId }: { exerciseId: string; setId: string }) =>
      workoutsService.deleteSet(workoutId, exerciseId, setId),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: [WORKOUT_DETAILS_QUERY_KEY] });
    },
  });

  const { mutateAsync: removeWorkoutExercise, isPending: isRemovingExercise } = useMutation({
    mutationFn: (exerciseId: string) => workoutsService.skipExercise(workoutId, exerciseId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [WORKOUT_DETAILS_QUERY_KEY] });
    },
  });

  if (!workout) {
    // TODO: Добавить заглушку, что не смогли получить данные тренировки
    return null;
  }

  const isFinished = Boolean(workout.finishedAt);
  const busy = isPending || isRemovingExercise;
  const exercises = workout.exercises;

  function handleFinish() {
    if (hasUnfilledSets(exercises)) {
      setShowIncompleteErrors(true);
      toast.error("Не все данные заполнены");
      return;
    }

    setShowIncompleteErrors(false);
    finishWorkout();
  }

  return (
    <PageContent>
      <PageContent.Header>{workout.templateName}</PageContent.Header>
      <PageContent.Body>
        <Typography>Начата {formatDate(workout.startedAt)}</Typography>
        {workout.finishedAt && (
          <Typography as="output">Завершена {formatDate(workout.finishedAt)}</Typography>
        )}
        <WorkoutExerciseList
          workoutId={workoutId}
          exercises={exercises}
          finished={isFinished}
          disabled={busy}
          showIncompleteErrors={showIncompleteErrors}
          onAddSet={addWorkoutSet}
          onRemoveSet={(exerciseId, setId) => removeWorkoutSet({ exerciseId, setId })}
          onRemoveExercise={removeWorkoutExercise}
        />
        {!isFinished && (
          <Button disabled={busy} onClick={handleFinish}>
            {isPending ? "Завершение…" : "Завершить тренировку"}
          </Button>
        )}
      </PageContent.Body>
    </PageContent>
  );
}
