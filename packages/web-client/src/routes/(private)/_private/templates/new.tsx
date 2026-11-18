import { createFileRoute } from "@tanstack/react-router";

import { NewTemplatePage } from "./_pages/NewTemplatePage";

export const Route = createFileRoute("/(private)/_private/templates/new")({
  component: NewTemplatePage,
});
