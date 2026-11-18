import { queryOptions } from "@tanstack/react-query";

import { exercisesService, templatesService, workoutsService } from "~/shared/api/fitnessService";

export const exerciseQueries = {
  list: (search = "", page = 0) =>
    queryOptions({
      queryKey: ["exercises", "list", search, page],
      queryFn: () => exercisesService.list(search, page),
    }),
  detail: (id: string) =>
    queryOptions({
      queryKey: ["exercises", "detail", id],
      queryFn: () => exercisesService.get(id),
    }),
};

export const templateQueries = {
  list: (page = 0) =>
    queryOptions({
      queryKey: ["templates", "list", page],
      queryFn: () => templatesService.list(page),
    }),
  detail: (id: string) =>
    queryOptions({
      queryKey: ["templates", "detail", id],
      queryFn: () => templatesService.get(id),
    }),
};

export const workoutQueries = {
  list: (page = 0) =>
    queryOptions({
      queryKey: ["workouts", "list", page],
      queryFn: () => workoutsService.list(page),
    }),
  active: () =>
    queryOptions({
      queryKey: ["workouts", "active"],
      queryFn: () => workoutsService.active(),
      staleTime: 0,
    }),
  detail: (id: string) =>
    queryOptions({
      queryKey: ["workouts", "detail", id],
      queryFn: () => workoutsService.get(id),
      staleTime: 0,
    }),
};
