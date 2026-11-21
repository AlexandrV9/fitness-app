import { TemplateForm } from "~/features/fitness/components/TemplateForm";
import { PageContent } from "~/shared/ui";

export function NewTemplatePage() {
  return (
    <PageContent>
      <PageContent.Header>Новый шаблон</PageContent.Header>
      <PageContent.Body>
        <TemplateForm />
      </PageContent.Body>
    </PageContent>
  );
}
