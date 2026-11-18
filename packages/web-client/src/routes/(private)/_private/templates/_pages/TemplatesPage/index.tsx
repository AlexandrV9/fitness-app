import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useState } from "react";

import { templateQueries } from "~/features/fitness/queries";
import { templatesService } from "~/shared/api/fitnessService";
import { Button, Card, Flex, Page, Pagination, QueryFeedback, Typography } from "~/shared/ui";

export function TemplatesPage() {
  const [page, setPage] = useState(0);
  const queryClient = useQueryClient();
  const templates = useQuery(templateQueries.list(page));
  const remove = useMutation({
    mutationFn: templatesService.remove,
    onSuccess: async () => {
      if (templates.data?.data.length === 1 && page > 0) setPage(page - 1);
      await queryClient.invalidateQueries({ queryKey: ["templates"] });
    },
  });
  return (
    <Page title="Шаблоны тренировок" actions={<Link to="/templates/new">Создать шаблон</Link>}>
      <QueryFeedback {...templates} onRetry={() => void templates.refetch()} />
      {templates.data?.data.length === 0 && (
        <Typography>Создайте шаблон и добавьте в него упражнения.</Typography>
      )}
      {templates.data?.data.map((template) => (
        <Card key={template.id} title={template.name}>
          <Flex align="center" columnGap={16}>
            <Link to="/templates/$templateId" params={{ templateId: template.id }}>
              Изменить
            </Link>
            <Button
              size="m"
              variant="outline"
              color="alert"
              disabled={remove.isPending}
              onClick={() => {
                if (window.confirm("Удалить шаблон «" + template.name + "»?"))
                  remove.mutate(template.id);
              }}
            >
              Удалить
            </Button>
          </Flex>
        </Card>
      ))}
      {templates.data && (
        <Pagination
          pagination={templates.data.pagination}
          onChange={setPage}
          disabled={templates.isFetching}
        />
      )}
    </Page>
  );
}
