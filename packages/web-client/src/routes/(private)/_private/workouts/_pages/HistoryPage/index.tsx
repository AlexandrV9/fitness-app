import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useState } from "react";

import { formatDate } from "~/features/fitness/parameters";
import { workoutQueries } from "~/features/fitness/queries";
import { Card, Page, Pagination, QueryFeedback, Typography } from "~/shared/ui";

export function HistoryPage() {
  const [page, setPage] = useState(0);
  const workouts = useQuery(workoutQueries.list(page));
  return (
    <Page title="История тренировок">
      <QueryFeedback {...workouts} onRetry={() => void workouts.refetch()} />
      {workouts.data?.data.length === 0 && (
        <Typography>Здесь появятся ваши тренировки.</Typography>
      )}
      {workouts.data?.data.map((workout) => (
        <Card key={workout.id} title={workout.templateName}>
          <Typography>
            {formatDate(workout.startedAt)} ·{" "}
            {workout.finishedAt ? "Завершена" : "В процессе"}
          </Typography>
          <Link to="/workouts/$workoutId" params={{ workoutId: workout.id }}>
            {workout.finishedAt ? "Посмотреть результаты" : "Продолжить тренировку"}
          </Link>
        </Card>
      ))}
      {workouts.data && (
        <Pagination
          pagination={workouts.data.pagination}
          onChange={setPage}
          disabled={workouts.isFetching}
        />
      )}
    </Page>
  );
}
