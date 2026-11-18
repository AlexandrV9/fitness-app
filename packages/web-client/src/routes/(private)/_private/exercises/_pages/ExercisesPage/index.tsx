import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useState } from "react";

import { parameterLabel } from "~/features/fitness/parameters";
import { exerciseQueries } from "~/features/fitness/queries";
import { exercisesService } from "~/shared/api/fitnessService";
import {
  Button,
  Card,
  Flex,
  Page,
  Pagination,
  QueryFeedback,
  Search,
  Typography,
} from "~/shared/ui";

export function ExercisesPage() {
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);

  const exercises = useQuery(exerciseQueries.list(search, page));

  const remove = useMutation({
    mutationFn: exercisesService.remove,
    onSuccess: async () => {
      if (exercises.data?.data.length === 1 && page > 0) setPage(page - 1);
      await queryClient.invalidateQueries({ queryKey: ["exercises"] });
    },
  });

  return (
    <Page title="Упражнения" actions={<Link to="/exercises/new">Добавить упражнение</Link>}>
      <Search
        value={search}
        aria-label="Поиск упражнений"
        placeholder="Поиск по названию"
        onChange={(event) => {
          setSearch(event.target.value);
          setPage(0);
        }}
        onReset={() => {
          setSearch("");
          setPage(0);
        }}
        fullWidth
      />
      <QueryFeedback {...exercises} onRetry={() => void exercises.refetch()} />
      {exercises.data?.data.length === 0 && (
        <Typography>
          {search.trim()
            ? "Ничего не найдено."
            : "У вас пока нет упражнений. Добавьте первое упражнение."}
        </Typography>
      )}
      {exercises.data?.data.map((exercise) => (
        <Card key={exercise.id} title={exercise.name}>
          <Typography>{exercise.parameterSchema.map(parameterLabel).join(" · ")}</Typography>
          <Flex columnGap={16} rowGap={8} wrap="wrap" align="center">
            <Link to="/exercises/$exerciseId" params={{ exerciseId: exercise.id }}>
              Изменить
            </Link>
            <Button
              size="m"
              variant="outline"
              color="alert"
              disabled={remove.isPending}
              onClick={() => {
                if (window.confirm("Удалить упражнение «" + exercise.name + "»?"))
                  remove.mutate(exercise.id);
              }}
            >
              Удалить
            </Button>
          </Flex>
        </Card>
      ))}
      {exercises.data && (
        <Pagination
          pagination={exercises.data.pagination}
          onChange={setPage}
          disabled={exercises.isFetching}
        />
      )}
    </Page>
  );
}
