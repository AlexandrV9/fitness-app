import { useQuery } from "@tanstack/react-query";

import { ExerciseForm } from "~/features/fitness/components/ExerciseForm";
import { exerciseQueries } from "~/features/fitness/queries";
import { Page, QueryFeedback } from "~/shared/ui";

export function ExerciseEditorPage({ id }: { id: string }) {
  const exercise = useQuery(exerciseQueries.detail(id));
  return (
    <Page title="Изменить упражнение">
      <QueryFeedback {...exercise} onRetry={() => void exercise.refetch()} />
      {exercise.data && <ExerciseForm key={exercise.data.id} exercise={exercise.data} />}
    </Page>
  );
}
