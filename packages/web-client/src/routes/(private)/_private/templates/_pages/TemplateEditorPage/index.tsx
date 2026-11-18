import { useQuery } from "@tanstack/react-query";

import { TemplateForm } from "~/features/fitness/components/TemplateForm";
import { templateQueries } from "~/features/fitness/queries";
import { Page, QueryFeedback } from "~/shared/ui";

export function TemplateEditorPage({ id }: { id: string }) {
  const template = useQuery(templateQueries.detail(id));
  return (
    <Page title="Изменить шаблон">
      <QueryFeedback {...template} onRetry={() => void template.refetch()} />
      {template.data && <TemplateForm key={template.data.id} template={template.data} />}
    </Page>
  );
}
