import { createFileRoute } from "@tanstack/react-router";

import { ExerciseEditorPage } from "./_pages/ExerciseEditorPage";

export const Route = createFileRoute("/(private)/_private/exercises/$exerciseId")({
  component: RoutePage,
});

function RoutePage() {
  const { exerciseId } = Route.useParams();

  return <ExerciseEditorPage key={exerciseId} id={exerciseId} />;
}
