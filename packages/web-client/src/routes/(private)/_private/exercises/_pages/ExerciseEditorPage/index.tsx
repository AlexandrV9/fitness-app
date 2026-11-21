import { useQuery } from "@tanstack/react-query";

import { ExerciseForm } from "~/features/fitness/components/ExerciseForm";
import { exerciseDetailsQueryOptions } from "~/features/fitness/queries";
import { PageContent, QueryFeedback } from "~/shared/ui";

export function ExerciseEditorPage({ id }: { id: string }) {
  const exercise = useQuery(exerciseDetailsQueryOptions(id));

  return (
    <PageContent>
      <PageContent.Header>Изменить упражнение</PageContent.Header>
      <PageContent.Body>
        <QueryFeedback {...exercise} onRetry={() => exercise.refetch()} />
        {exercise.data && <ExerciseForm key={exercise.data.id} exercise={exercise.data} />}
      </PageContent.Body>
    </PageContent>
  );
}
