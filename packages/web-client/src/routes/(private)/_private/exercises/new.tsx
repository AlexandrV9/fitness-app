import { createFileRoute } from "@tanstack/react-router";

import { NewExercisePage } from "./_pages/NewExercisePage";

export const Route = createFileRoute("/(private)/_private/exercises/new")({
  component: NewExercisePage,
});
