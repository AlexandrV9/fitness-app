import { createFileRoute } from "@tanstack/react-router";

import { HomePage } from "./_pages/HomePage";

export const Route = createFileRoute("/(private)/_private/")({
  component: HomePage,
});
