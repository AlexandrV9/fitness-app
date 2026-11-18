import { createFileRoute } from "@tanstack/react-router";

import { WorkoutPage } from "./_pages/WorkoutPage";

export const Route = createFileRoute("/(private)/_private/workouts/$workoutId")({
  component: RoutePage,
});

function RoutePage() {
  const { workoutId } = Route.useParams();

  return <WorkoutPage key={workoutId} id={workoutId} />;
}
