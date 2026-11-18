import { ExerciseForm } from "~/features/fitness/components/ExerciseForm";
import { Page } from "~/shared/ui";

export function NewExercisePage() {
  return (
    <Page title="Новое упражнение">
      <ExerciseForm />
    </Page>
  );
}
