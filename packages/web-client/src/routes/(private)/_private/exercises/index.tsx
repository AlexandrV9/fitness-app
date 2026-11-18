import { createFileRoute } from "@tanstack/react-router";

import { ExercisesPage } from "./_pages/ExercisesPage";

export const Route = createFileRoute("/(private)/_private/exercises/")({
  component: ExercisesPage,
});
