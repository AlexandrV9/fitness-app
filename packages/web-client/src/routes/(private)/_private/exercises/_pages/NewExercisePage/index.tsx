import { ExerciseForm } from "~/features/fitness/components/ExerciseForm";
import { PageContent } from "~/shared/ui";

export function NewExercisePage() {
  return (
    <PageContent>
      <PageContent.Header>Новое упражнение</PageContent.Header>
      <PageContent.Body>
        <ExerciseForm />
      </PageContent.Body>
    </PageContent>
  );
}
