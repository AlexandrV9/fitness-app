import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useState } from "react";

import {
  TEMPLATE_DETAILS_QUERY_KEY,
  TEMPLATES_QUERY_KEY,
  templatesQueryOptions,
} from "~/features/fitness/queries";
import { templatesService } from "~/shared/api/fitnessService";
import { Button, Card, Flex, PageContent, Pagination, QueryFeedback, Typography } from "~/shared/ui";

export function TemplatesPage() {
  const [page, setPage] = useState(0);
  const queryClient = useQueryClient();
  const templates = useQuery(templatesQueryOptions(page));

  const remove = useMutation({
    mutationFn: templatesService.remove,
    onSuccess: async () => {
      if (templates.data?.data.length === 1 && page > 0) {
        setPage(page - 1);
      }
      await queryClient.invalidateQueries({ queryKey: [TEMPLATES_QUERY_KEY] });
      await queryClient.invalidateQueries({ queryKey: [TEMPLATE_DETAILS_QUERY_KEY] });
    },
  });
  return (
    <PageContent>
      <PageContent.Header actions={<Link to="/templates/new">Создать шаблон</Link>}>
        Шаблоны тренировок
      </PageContent.Header>
      <PageContent.Body>
        <QueryFeedback {...templates} onRetry={() => templates.refetch()} />
        {templates.data?.data.length === 0 && (
          <Typography>Создайте шаблон и добавьте в него упражнения.</Typography>
        )}

        {templates.data && templates.data.data.length > 0 && (
          <Flex as="ul" direction="column" rowGap={20} style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {templates.data.data.map((template) => (
              <Card key={template.id} as="li">
                <Card.Header>
                  <Card.Title>{template.name}</Card.Title>
                </Card.Header>
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
          </Flex>
        )}
        {templates.data && (
          <Pagination
            pagination={templates.data.pagination}
            onChange={setPage}
            disabled={templates.isFetching}
          />
        )}
      </PageContent.Body>
    </PageContent>
  );
}
