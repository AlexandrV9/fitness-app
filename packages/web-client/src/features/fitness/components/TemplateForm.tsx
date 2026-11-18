import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import { templatesService } from "~/shared/api/fitnessService";
import { useUnsavedChanges } from "~/shared/hooks/useUnsavedChanges";
import {
  Button,
  Card,
  Flex,
  Pagination,
  QueryFeedback,
  Search,
  TextInput,
  Typography,
} from "~/shared/ui";

import { exerciseQueries } from "../queries";

import type {
  TemplateDetail,
  TemplateExerciseInput,
  TemplateInput,
} from "~/shared/api/fitnessTypes";

type SelectedExercise = TemplateExerciseInput & { name: string };

export function TemplateForm({ template }: { template?: TemplateDetail }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [name, setName] = useState(template?.name ?? "");
  const [selected, setSelected] = useState<SelectedExercise[]>(() =>
    template
      ? [...template.exercises]
          .sort((a, b) => a.position - b.position)
          .map((item) => ({ ...item, plannedSets: item.plannedSets ?? 1 }))
      : [],
  );
  const [dirty, setDirty] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const exercises = useQuery(exerciseQueries.list(search, page));
  const save = useMutation({
    mutationFn: (input: TemplateInput) =>
      template ? templatesService.update(template.id, input) : templatesService.create(input),
    onSuccess: async () => {
      setDirty(false);
      await queryClient.invalidateQueries({ queryKey: ["templates"] });
      await navigate({ to: "/templates" });
    },
  });
  useUnsavedChanges(dirty && !save.isSuccess);

  function move(index: number, offset: number) {
    const next = [...selected];
    const target = index + offset;
    [next[index], next[target]] = [next[target], next[index]];
    setSelected(next);
    setDirty(true);
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        save.mutate({
          name: name.trim(),
          exercises: selected.map(({ exerciseId, plannedSets }) => ({ exerciseId, plannedSets })),
        });
      }}
    >
      <fieldset disabled={save.isPending} style={{ border: 0, padding: 0, margin: 0, minWidth: 0 }}>
        <Flex direction="column" rowGap={20}>
          <TextInput
            label="Название тренировки"
            value={name}
            maxLength={100}
            required
            fullWidth
            onChange={(event) => {
              setName(event.target.value);
              setDirty(true);
            }}
          />
          <Card title="Состав тренировки">
            {selected.length === 0 && <Typography>Выберите упражнения из списка ниже.</Typography>}
            {selected.map((exercise, index) => (
              <Flex direction="column" rowGap={10} key={exercise.exerciseId}>
                <Typography variant="h_3">
                  {index + 1}. {exercise.name}
                </Typography>
                <TextInput
                  label={"Количество подходов — " + exercise.name}
                  type="number"
                  min={1}
                  max={100}
                  step={1}
                  value={exercise.plannedSets ?? ""}
                  required
                  onChange={(event) => {
                    setSelected(
                      selected.map((item, current) =>
                        current === index
                          ? {
                              ...item,
                              plannedSets:
                                event.target.value === "" ? null : Number(event.target.value),
                            }
                          : item,
                      ),
                    );
                    setDirty(true);
                  }}
                />
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
                  <Button
                    type="button"
                    size="m"
                    variant="outline"
                    color="alert"
                    onClick={() => {
                      setSelected(
                        selected.filter((item) => item.exerciseId !== exercise.exerciseId),
                      );
                      setDirty(true);
                    }}
                  >
                    Убрать
                  </Button>
                </Flex>
              </Flex>
            ))}
          </Card>
          <Card title="Добавить упражнения">
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
            <QueryFeedback {...exercises} onRetry={() => void exercises.refetch()} />
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
                  <Button
                    type="button"
                    size="m"
                    variant="outline"
                    disabled={isSelected || selected.length >= 100}
                    onClick={() => {
                      setSelected([
                        ...selected,
                        { exerciseId: exercise.id, name: exercise.name, plannedSets: 1 },
                      ]);
                      setDirty(true);
                    }}
                  >
                    {isSelected ? "Добавлено" : "Добавить"}
                  </Button>
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
          <Flex align="center" columnGap={16}>
            <Button
              type="submit"
              disabled={save.isPending || selected.length === 0 || !name.trim()}
            >
              {save.isPending ? "Сохранение…" : "Сохранить шаблон"}
            </Button>
            <Link to="/templates">Отмена</Link>
          </Flex>
        </Flex>
      </fieldset>
    </form>
  );
}
