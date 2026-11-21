import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import z from "zod";

import { TextInputField, useForm } from "~/features/form";
import { exercisesService } from "~/shared/api/fitnessService";
import { Button, Card, Flex, Typography } from "~/shared/ui";

import { getVisibleParameters, parameterLabel } from "../parameters";
import { EXERCISE_QUERY_KEY, EXERCISES_DETAILS_QUERY_KEY } from "../queries";

import type { Exercise } from "~/shared/api/fitnessTypes";

const schema = z.object({
  name: z.string().trim().min(1, "Введите название").max(100, "Максимум 100 символов"),
});

export function ExerciseForm({ exercise }: { exercise?: Exercise }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const form = useForm({ schema, defaultValues: { name: exercise?.name ?? "" } });

  const save = useMutation({
    mutationFn: ({ name }: z.infer<typeof schema>) =>
      exercise ? exercisesService.update(exercise.id, name) : exercisesService.create(name),
    onSuccess: async (_, input) => {
      form.reset(input);
      await queryClient.invalidateQueries({ queryKey: [EXERCISE_QUERY_KEY] });
      await queryClient.invalidateQueries({ queryKey: [EXERCISES_DETAILS_QUERY_KEY] });
      await navigate({ to: "/exercises" });
    },
  });

  return (
    <form onSubmit={form.handleSubmit((values) => save.mutate(values))}>
      <Card>
        <TextInputField
          name="name"
          control={form.control}
          label="Название упражнения"
          maxLength={100}
          disabled={save.isPending}
          fullWidth
        />
        <Typography>
          Параметры подхода —{" "}
          {exercise
            ? getVisibleParameters(exercise.parameterSchema).map(parameterLabel).join(", ") ||
              "без параметров"
            : "вес, повторения"}
          .
        </Typography>
        <Flex align="center" columnGap={16}>
          <Button type="submit" disabled={save.isPending}>
            {save.isPending ? "Сохранение…" : "Сохранить"}
          </Button>
          <Link to="/exercises">Отмена</Link>
        </Flex>
      </Card>
    </form>
  );
}
