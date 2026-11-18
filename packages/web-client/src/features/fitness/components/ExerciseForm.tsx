import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import z from "zod";

import { TextInputField, useForm } from "~/features/form";
import { exercisesService } from "~/shared/api/fitnessService";
import { useUnsavedChanges } from "~/shared/hooks/useUnsavedChanges";
import { Button, Card, Flex, Typography } from "~/shared/ui";

import { parameterLabel } from "../parameters";

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
      await queryClient.invalidateQueries({ queryKey: ["exercises"] });
      await navigate({ to: "/exercises" });
    },
  });
  useUnsavedChanges(form.formState.isDirty && !save.isSuccess);

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
            ? exercise.parameterSchema.map(parameterLabel).join(", ") || "без параметров"
            : "вес, повторения, самочувствие"}
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
