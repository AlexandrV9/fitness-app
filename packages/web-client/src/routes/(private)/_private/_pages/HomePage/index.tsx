import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { z } from "zod";

import { useAuthStore } from "~/features/auth";
import { formatDate } from "~/features/fitness/parameters";
import {
  ACTIVE_WORKOUT_QUERY_KEY,
  activeWorkoutQueryOptions,
  WORKOUT_DETAILS_QUERY_KEY,
  WORKOUTS_QUERY_KEY,
} from "~/features/fitness/queries";
import { useForm } from "~/features/form";
import { workoutsService } from "~/shared/api/fitnessService";
import { getErrorMessage } from "~/shared/api/getErrorMessage";
import { Button, Card, Flex, PageContent, QueryFeedback, Typography } from "~/shared/ui";
import { toast } from "~/shared/ui/Toast";

import { TemplateSelectField } from "./TemplateSelectField";

const startWorkoutSchema = z.object({
  templateId: z.string(),
});

const WORKOUT_QUERY_KEYS = [
  WORKOUT_DETAILS_QUERY_KEY,
  ACTIVE_WORKOUT_QUERY_KEY,
  WORKOUTS_QUERY_KEY,
] as const;

export function HomePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const login = useAuthStore((state) => state.user?.login);

  const { control, watch } = useForm({
    schema: startWorkoutSchema,
    defaultValues: { templateId: "" },
  });
  const templateId = watch("templateId");

  const {
    data: activeWorkout,
    error: errorGetActiveWorkout,
    refetch: refetchActiveWorkout,
    isPending: isPendingGetActiveWorkout,
  } = useQuery(activeWorkoutQueryOptions());

  const { mutate: startWorkout, isPending: isPendingStartWorkout } = useMutation({
    mutationFn: workoutsService.start,
    onSuccess: async (workout) => {
      for (const queryKey of WORKOUT_QUERY_KEYS) {
        await queryClient.invalidateQueries({ queryKey: [queryKey] });
      }
      await navigate({ to: "/workouts/$workoutId", params: { workoutId: workout.id } });
    },
    onError: async (error) => {
      queryClient.invalidateQueries({ queryKey: [ACTIVE_WORKOUT_QUERY_KEY] });
      toast.error(getErrorMessage(error));
    },
  });

  if (activeWorkout) {
    return (
      <PageContent>
        <PageContent.Header>{"Привет, " + (login ?? "")}</PageContent.Header>
        <PageContent.Body>
          <Card>
            <Card.Header>
              <Card.Title>Активная тренировка</Card.Title>
            </Card.Header>
            <Typography>{activeWorkout.templateName}</Typography>
            <Typography>Начата {formatDate(activeWorkout.startedAt)}</Typography>
            <Link to="/workouts/$workoutId" params={{ workoutId: activeWorkout.id }}>
              Продолжить тренировку
            </Link>
          </Card>
        </PageContent.Body>
      </PageContent>
    );
  }

  return (
    <PageContent>
      <PageContent.Header>{"Привет, " + (login ?? "")}</PageContent.Header>
      <PageContent.Body>
        <QueryFeedback
          isPending={isPendingGetActiveWorkout}
          error={errorGetActiveWorkout}
          onRetry={() => refetchActiveWorkout()}
        />
        <Card>
          <Card.Header>
            <Card.Title>Начать тренировку</Card.Title>
          </Card.Header>
          <Card.Body>
            <Flex direction="column" rowGap={16} as="form" align="start">
              <TemplateSelectField
                name="templateId"
                control={control}
                disabled={isPendingStartWorkout}
              />
              <Button
                disabled={!templateId || isPendingStartWorkout}
                onClick={() => startWorkout(templateId)}
              >
                {isPendingStartWorkout ? "Запуск…" : "Начать тренировку"}
              </Button>
            </Flex>
          </Card.Body>
        </Card>
      </PageContent.Body>
    </PageContent>
  );
}
