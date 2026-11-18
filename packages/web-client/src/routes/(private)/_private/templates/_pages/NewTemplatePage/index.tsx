import { TemplateForm } from "~/features/fitness/components/TemplateForm";
import { Page } from "~/shared/ui";

export function NewTemplatePage() {
  return (
    <Page title="Новый шаблон">
      <TemplateForm />
    </Page>
  );
}
