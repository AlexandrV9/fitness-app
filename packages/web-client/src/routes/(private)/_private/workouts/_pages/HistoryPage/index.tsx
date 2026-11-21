import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useState } from "react";

import { formatDate } from "~/features/fitness/parameters";
import { workoutsQueryOptions } from "~/features/fitness/queries";
import { Card, Flex, PageContent, Pagination, QueryFeedback, Typography } from "~/shared/ui";

export function HistoryPage() {
  const [page, setPage] = useState(0);

  const workouts = useQuery(workoutsQueryOptions(page));

  return (
    <PageContent>
      <PageContent.Header>История тренировок</PageContent.Header>
      <PageContent.Body>
        <QueryFeedback {...workouts} onRetry={() => workouts.refetch()} />
        {workouts.data?.data.length === 0 && (
          <Typography>Здесь появятся ваши тренировки.</Typography>
        )}
        {workouts.data && workouts.data.data.length > 0 && (
          <Flex as="ul" direction="column" rowGap={20} style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {workouts.data.data.map((workout) => (
              <Card key={workout.id} as="li">
                <Card.Header>
                  <Card.Title>{workout.templateName}</Card.Title>
                </Card.Header>
                <Typography>
                  {formatDate(workout.startedAt)} · {workout.finishedAt ? "Завершена" : "В процессе"}
                </Typography>
                <Link to="/workouts/$workoutId" params={{ workoutId: workout.id }}>
                  {workout.finishedAt ? "Посмотреть результаты" : "Продолжить тренировку"}
                </Link>
              </Card>
            ))}
          </Flex>
        )}
        {workouts.data && (
          <Pagination
            pagination={workouts.data.pagination}
            onChange={setPage}
            disabled={workouts.isFetching}
          />
        )}
      </PageContent.Body>
    </PageContent>
  );
}
