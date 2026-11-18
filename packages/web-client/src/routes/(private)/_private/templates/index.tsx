import { createFileRoute } from "@tanstack/react-router";

import { TemplatesPage } from "./_pages/TemplatesPage";

export const Route = createFileRoute("/(private)/_private/templates/")({
  component: TemplatesPage,
});
