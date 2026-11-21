import { useQuery } from "@tanstack/react-query";

import { TemplateForm } from "~/features/fitness/components/TemplateForm";
import { templateDetailsQueryOptions } from "~/features/fitness/queries";
import { PageContent, QueryFeedback } from "~/shared/ui";

export function TemplateEditorPage({ id }: { id: string }) {
  const template = useQuery(templateDetailsQueryOptions(id));
  return (
    <PageContent>
      <PageContent.Header>Изменить шаблон</PageContent.Header>
      <PageContent.Body>
        <QueryFeedback {...template} onRetry={() => template.refetch()} />
        {template.data && <TemplateForm key={template.data.id} template={template.data} />}
      </PageContent.Body>
    </PageContent>
  );
}
