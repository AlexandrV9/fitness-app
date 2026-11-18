import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import { useAuthStore } from "~/features/auth";
import { formatDate } from "~/features/fitness/parameters";
import { templateQueries, workoutQueries } from "~/features/fitness/queries";
import { workoutsService } from "~/shared/api/fitnessService";
import { getErrorMessage } from "~/shared/api/getErrorMessage";
import {
  Button,
  Card,
  Page,
  Pagination,
  QueryFeedback,
  Select,
  Typography,
} from "~/shared/ui";
import { toast } from "~/shared/ui/Toast";

export function HomePage() {
  const login = useAuthStore((state) => state.user?.login);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [templateId, setTemplateId] = useState("");
  const templates = useQuery(templateQueries.list(page));
  const active = useQuery(workoutQueries.active());
  const start = useMutation({
    mutationFn: workoutsService.start,
    onSuccess: async (workout) => {
      queryClient.setQueryData(workoutQueries.detail(workout.id).queryKey, workout);
      queryClient.setQueryData(workoutQueries.active().queryKey, workout);
      await queryClient.invalidateQueries({ queryKey: ["workouts", "list"] });
      await navigate({ to: "/workouts/$workoutId", params: { workoutId: workout.id } });
    },
    onError: async (error) => {
      await active.refetch();
      toast.error(getErrorMessage(error));
    },
  });

  return (
    <Page title={"Привет, " + (login ?? "")}>
      <QueryFeedback {...active} onRetry={() => void active.refetch()} />
      {active.data && (
        <Card title="Активная тренировка">
          <Typography>{active.data.templateName}</Typography>
          <Typography>Начата {formatDate(active.data.startedAt)}</Typography>
          <Link to="/workouts/$workoutId" params={{ workoutId: active.data.id }}>
            Продолжить тренировку
          </Link>
        </Card>
      )}
      {active.isSuccess && !active.data && (
        <Card title="Начать тренировку">
          <QueryFeedback {...templates} onRetry={() => void templates.refetch()} />
          {templates.data?.data.length === 0 && (
            <Typography>
              У вас пока нет шаблонов тренировок. Создайте первый шаблон.
            </Typography>
          )}
          {Boolean(templates.data?.data.length) && (
            <>
              <Select
                label="Выберите тренировку"
                value={templateId}
                onChange={(event) => setTemplateId(event.target.value)}
                disabled={start.isPending}
              >
                <option value="">Выберите шаблон</option>
                {templates.data?.data.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </Select>
              <Button
                disabled={!templateId || start.isPending}
                onClick={() => start.mutate(templateId)}
              >
                {start.isPending ? "Запуск…" : "Начать тренировку"}
              </Button>
            </>
          )}
          {templates.data && (
            <Pagination
              pagination={templates.data.pagination}
              disabled={templates.isFetching || start.isPending}
              onChange={(next) => {
                setPage(next);
                setTemplateId("");
              }}
            />
          )}
          <Link to="/templates/new">Создать шаблон</Link>
        </Card>
      )}
      <Link to="/exercises">Открыть банк упражнений</Link>
      <Link to="/workouts">История тренировок</Link>
    </Page>
  );
}
