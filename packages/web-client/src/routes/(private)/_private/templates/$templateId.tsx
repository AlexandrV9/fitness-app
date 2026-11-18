import { createFileRoute } from "@tanstack/react-router";

import { TemplateEditorPage } from "./_pages/TemplateEditorPage";

export const Route = createFileRoute("/(private)/_private/templates/$templateId")({
  component: RoutePage,
});

function RoutePage() {
  const { templateId } = Route.useParams();
  return <TemplateEditorPage key={templateId} id={templateId} />;
}
