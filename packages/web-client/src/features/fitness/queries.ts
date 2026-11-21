import { queryOptions } from "@tanstack/react-query";

import { exercisesService, templatesService, workoutsService } from "~/shared/api/fitnessService";

export const EXERCISE_QUERY_KEY = "exercises";
export const EXERCISES_DETAILS_QUERY_KEY = "exercise_details";

export const exercisesQueryOptions = (search = "", page = 0) =>
  queryOptions({
    queryKey: [EXERCISE_QUERY_KEY, search, page],
    queryFn: () => exercisesService.list(search, page),
  });

export const exerciseDetailsQueryOptions = (exerciseId: string) =>
  queryOptions({
    queryKey: [EXERCISES_DETAILS_QUERY_KEY, exerciseId],
    queryFn: () => exercisesService.get(exerciseId),
  });

export const TEMPLATES_QUERY_KEY = "templates";
export const TEMPLATE_DETAILS_QUERY_KEY = "template_details";

export const templatesQueryOptions = (page: number) =>
  queryOptions({
    queryKey: [TEMPLATES_QUERY_KEY, page],
    queryFn: () => templatesService.list(page),
  });

export const templateDetailsQueryOptions = (templateId: string) =>
  queryOptions({
    queryKey: [TEMPLATE_DETAILS_QUERY_KEY, templateId],
    queryFn: () => templatesService.get(templateId),
  });

export const WORKOUT_DETAILS_QUERY_KEY = "workout_details";
export const ACTIVE_WORKOUT_QUERY_KEY = "active_workout";
export const WORKOUTS_QUERY_KEY = "workouts";

export const workoutsQueryOptions = (page = 0) =>
  queryOptions({
    queryKey: [WORKOUTS_QUERY_KEY, page],
    queryFn: () => workoutsService.list(page),
  });

export const activeWorkoutQueryOptions = () =>
  queryOptions({
    queryKey: [ACTIVE_WORKOUT_QUERY_KEY],
    queryFn: () => workoutsService.active(),
    staleTime: 0,
  });

export const workoutDetailsQueryOptions = (workoutId: string) =>
  queryOptions({
    queryKey: [WORKOUT_DETAILS_QUERY_KEY, workoutId],
    queryFn: () => workoutsService.get(workoutId),
  });
