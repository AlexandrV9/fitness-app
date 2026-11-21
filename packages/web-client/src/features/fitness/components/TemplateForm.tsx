import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import { templatesService } from "~/shared/api/fitnessService";
import {
  Button,
  Card,
  Flex,
  Pagination,
  QueryFeedback,
  Search,
  Switch,
  TextInput,
  Typography,
} from "~/shared/ui";
import { MinusButton, PlusButton } from "~/shared/ui/сontrols";

import { exercisesQueryOptions, TEMPLATE_DETAILS_QUERY_KEY, TEMPLATES_QUERY_KEY } from "../queries";

import type {
  TemplateDetail,
  TemplateExerciseInput,
  TemplateInput,
} from "~/shared/api/fitnessTypes";

type SelectedExercise = TemplateExerciseInput & { name: string };
type Step = 1 | 2 | 3;

const MAX_EXERCISES = 100;

export function TemplateForm({ template }: { template?: TemplateDetail }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [step, setStep] = useState<Step>(1);
  const [name, setName] = useState(template?.name ?? "");
  const [selected, setSelected] = useState<SelectedExercise[]>(() =>
    template
      ? [...template.exercises]
          .sort((a, b) => a.position - b.position)
          .map((item) => ({ ...item, plannedSets: item.plannedSets ?? 1 }))
      : [],
  );
  const [draftById, setDraftById] = useState<Record<string, SelectedExercise>>(() => {
    if (!template) return {};
    return Object.fromEntries(
      [...template.exercises]
        .sort((a, b) => a.position - b.position)
        .map((item) => [
          item.exerciseId,
          {
            exerciseId: item.exerciseId,
            name: item.name,
            plannedSets: item.plannedSets ?? 1,
          } satisfies SelectedExercise,
        ]),
    );
  });
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);

  const exercises = useQuery(exercisesQueryOptions(search, page));

  const save = useMutation({
    mutationFn: (input: TemplateInput) =>
      template ? templatesService.update(template.id, input) : templatesService.create(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [TEMPLATES_QUERY_KEY] });
      await queryClient.invalidateQueries({ queryKey: [TEMPLATE_DETAILS_QUERY_KEY] });
      await navigate({ to: "/templates" });
    },
  });

  const canGoToStep2 = Boolean(name.trim());
  const canGoToStep3 = selected.length > 0;

  function move(index: number, offset: number) {
    const next = [...selected];
    const target = index + offset;
    [next[index], next[target]] = [next[target], next[index]];
    setSelected(next);
  }

  function toggleExercise(exercise: { id: string; name: string }, checked: boolean) {
    if (checked) {
      if (selected.length >= MAX_EXERCISES) return;
      const draft = draftById[exercise.id] ?? {
        exerciseId: exercise.id,
        name: exercise.name,
        plannedSets: 1,
      };
      setSelected((prev) =>
        prev.some((item) => item.exerciseId === exercise.id) ? prev : [...prev, draft],
      );
      return;
    }

    const current = selected.find((item) => item.exerciseId === exercise.id);
    if (current) {
      setDraftById((drafts) => ({ ...drafts, [exercise.id]: current }));
    }
    setSelected((prev) => prev.filter((item) => item.exerciseId !== exercise.id));
  }

  function updatePlannedSets(index: number, value: string) {
    const next = selected.map((item, current) =>
      current === index
        ? {
            ...item,
            plannedSets: value === "" ? null : Number(value),
          }
        : item,
    );
    setSelected(next);
    const updated = next[index];
    if (updated) {
      setDraftById((drafts) => ({ ...drafts, [updated.exerciseId]: updated }));
    }
  }

  function stepPlannedSets(index: number, delta: number) {
    const current = selected[index]?.plannedSets ?? 1;
    const nextValue = Math.min(100, Math.max(1, current + delta));
    updatePlannedSets(index, String(nextValue));
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        if (step !== 3) return;
        save.mutate({
          name: name.trim(),
          exercises: selected.map(({ exerciseId, plannedSets }) => ({ exerciseId, plannedSets })),
        });
      }}
    >
      <fieldset disabled={save.isPending} style={{ border: 0, padding: 0, margin: 0, minWidth: 0 }}>
        <Flex direction="column" rowGap={20}>
          <Typography variant="text_2">
            Шаг {step} из 3{step === 1 && " — название"}
            {step === 2 && " — упражнения"}
            {step === 3 && " — параметры"}
          </Typography>

          {step === 1 && (
            <Card>
              <Card.Header>
                <Card.Title>Название тренировки</Card.Title>
              </Card.Header>
              <TextInput
                label="Название тренировки"
                placeholder="Full Body"
                value={name}
                maxLength={100}
                required
                fullWidth
                onChange={(event) => setName(event.target.value)}
              />
            </Card>
          )}

          {step === 2 && (
            <Card>
              <Card.Header>
                <Card.Title>Доступные упражнения</Card.Title>
              </Card.Header>
              <Search
                value={search}
                aria-label="Поиск упражнений"
                placeholder="Поиск по названию"
                fullWidth
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(0);
                }}
                onReset={() => {
                  setSearch("");
                  setPage(0);
                }}
              />
              <QueryFeedback {...exercises} onRetry={() => exercises.refetch()} />
              {exercises.data?.data.length === 0 && (
                <Typography>
                  {search.trim() ? "Ничего не найдено." : "Банк упражнений пуст."}
                </Typography>
              )}
              {exercises.data?.data.map((exercise) => {
                const isSelected = selected.some((item) => item.exerciseId === exercise.id);
                return (
                  <Flex
                    key={exercise.id}
                    align="center"
                    justify="space-between"
                    wrap="wrap"
                    rowGap={8}
                    columnGap={12}
                  >
                    <Typography>{exercise.name}</Typography>
                    <Switch
                      checked={isSelected}
                      disabled={!isSelected && selected.length >= MAX_EXERCISES}
                      onChange={(checked) => toggleExercise(exercise, checked)}
                    />
                  </Flex>
                );
              })}
              {exercises.data && (
                <Pagination
                  pagination={exercises.data.pagination}
                  onChange={setPage}
                  disabled={exercises.isFetching}
                />
              )}
              <Link to="/exercises/new">Создать упражнение</Link>
            </Card>
          )}

          {step === 3 && (
            <Card>
              <Card.Header>
                <Card.Title>Параметры упражнений</Card.Title>
              </Card.Header>
              {selected.map((exercise, index) => (
                <Flex direction="column" rowGap={10} key={exercise.exerciseId}>
                  <Typography variant="h_3">
                    {index + 1}. {exercise.name}
                  </Typography>
                  <Flex isFullWidth align="end" columnGap={8} rowGap={8}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <TextInput
                        label="Количество подходов"
                        type="number"
                        min={1}
                        step={1}
                        max={10}
                        size="m"
                        value={exercise.plannedSets ?? ""}
                        required
                        fullWidth
                        onChange={(event) => updatePlannedSets(index, event.target.value)}
                      />
                    </div>
                    <MinusButton
                      aria-label="Уменьшить количество подходов"
                      disabled={(exercise.plannedSets ?? 1) <= 1}
                      onClick={() => stepPlannedSets(index, -1)}
                    />
                    <PlusButton
                      aria-label="Увеличить количество подходов"
                      disabled={(exercise.plannedSets ?? 1) >= 100}
                      onClick={() => stepPlannedSets(index, 1)}
                    />
                  </Flex>

                  <Flex columnGap={8} rowGap={8} wrap="wrap">
                    <Button
                      type="button"
                      size="m"
                      variant="outline"
                      disabled={index === 0}
                      onClick={() => move(index, -1)}
                    >
                      Выше
                    </Button>
                    <Button
                      type="button"
                      size="m"
                      variant="outline"
                      disabled={index === selected.length - 1}
                      onClick={() => move(index, 1)}
                    >
                      Ниже
                    </Button>
                  </Flex>
                </Flex>
              ))}
            </Card>
          )}

          <Flex justify="space-between">
            <Link to="/templates">Отмена</Link>

            <Flex justify="end" align="center" columnGap={16} wrap="wrap" rowGap={8}>
              {step > 1 && (
                <Button type="button" variant="outline" onClick={() => setStep((step - 1) as Step)}>
                  Назад
                </Button>
              )}

              {step === 3 && (
                <Button
                  type="submit"
                  disabled={save.isPending || selected.length === 0 || !name.trim()}
                >
                  {save.isPending ? "Сохранение…" : "Сохранить шаблон"}
                </Button>
              )}

              {step < 3 && (
                <Button
                  type="button"
                  disabled={step === 1 ? !canGoToStep2 : !canGoToStep3}
                  onClick={() => setStep((step + 1) as Step)}
                >
                  Далее
                </Button>
              )}
            </Flex>
          </Flex>
        </Flex>
      </fieldset>
    </form>
  );
}
