import { createFileRoute } from "@tanstack/react-router";

import { HistoryPage } from "./_pages/HistoryPage";

export const Route = createFileRoute("/(private)/_private/workouts/")({
  component: HistoryPage,
});
