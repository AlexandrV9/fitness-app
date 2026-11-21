import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useState } from "react";

import { getVisibleParameters, parameterLabel } from "~/features/fitness/parameters";
import {
  EXERCISE_QUERY_KEY,
  EXERCISES_DETAILS_QUERY_KEY,
  exercisesQueryOptions,
} from "~/features/fitness/queries";
import { exercisesService } from "~/shared/api/fitnessService";
import {
  Button,
  Card,
  Flex,
  PageContent,
  Pagination,
  QueryFeedback,
  Search,
  Typography,
} from "~/shared/ui";

export function ExercisesPage() {
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);

  const exercises = useQuery(exercisesQueryOptions(search, page));

  const remove = useMutation({
    mutationFn: exercisesService.remove,
    onSuccess: async () => {
      if (exercises.data?.data.length === 1 && page > 0) setPage(page - 1);
      await queryClient.invalidateQueries({ queryKey: [EXERCISE_QUERY_KEY] });
      await queryClient.invalidateQueries({ queryKey: [EXERCISES_DETAILS_QUERY_KEY] });
    },
  });

  return (
    <PageContent>
      <PageContent.Header actions={<Link to="/exercises/new">Добавить упражнение</Link>}>
        Упражнения
      </PageContent.Header>
      <PageContent.Body>
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
        <QueryFeedback {...exercises} onRetry={() => exercises.refetch()} />
        {exercises.data?.data.length === 0 && (
          <Typography>
            {search.trim()
              ? "Ничего не найдено."
              : "У вас пока нет упражнений. Добавьте первое упражнение."}
          </Typography>
        )}
        {exercises.data && exercises.data.data.length > 0 && (
          <Flex as="ul" direction="column" rowGap={20} style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {exercises.data.data.map((exercise) => (
              <Card key={exercise.id} as="li">
                <Card.Header>
                  <Card.Title>{exercise.name}</Card.Title>
                </Card.Header>
                <Typography>
                  {getVisibleParameters(exercise.parameterSchema).map(parameterLabel).join(" · ")}
                </Typography>
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
          </Flex>
        )}
        {exercises.data && (
          <Pagination
            pagination={exercises.data.pagination}
            onChange={setPage}
            disabled={exercises.isFetching}
          />
        )}
      </PageContent.Body>
    </PageContent>
  );
}
