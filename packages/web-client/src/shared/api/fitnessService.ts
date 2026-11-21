import { axiosInstance } from "~/shared/config/axios";

import type {
  Exercise,
  Paginated,
  SetInput,
  TemplateDetail,
  TemplateInput,
  Workout,
  WorkoutDetail,
  WorkoutSet,
  WorkoutTemplate,
} from "./fitnessTypes";

type DataResponse<T> = { success: true; data: T };

export const exercisesService = {
  async list(query = "", page = 0) {
    const response = await axiosInstance.get<Paginated<Exercise>>("/exercises", {
      params: { query, page, size: 20 },
    });
    return response.data;
  },

  async get(id: string) {
    const response = await axiosInstance.get<DataResponse<Exercise>>("/exercises/" + id);
    return response.data.data;
  },

  async create(name: string) {
    const response = await axiosInstance.post<DataResponse<Exercise>>("/exercises", { name });
    return response.data.data;
  },

  async update(id: string, name: string) {
    const response = await axiosInstance.patch<DataResponse<Exercise>>("/exercises/" + id, {
      name,
    });
    return response.data.data;
  },

  async remove(id: string) {
    await axiosInstance.delete("/exercises/" + id);
  },
};

export const templatesService = {
  async list(page = 0) {
    const response = await axiosInstance.get<Paginated<WorkoutTemplate>>("/workout-templates", {
      params: { page, size: 20 },
    });
    return response.data;
  },

  async get(id: string) {
    const response = await axiosInstance.get<DataResponse<TemplateDetail>>(
      "/workout-templates/" + id,
    );
    return response.data.data;
  },

  async create(input: TemplateInput) {
    const response = await axiosInstance.post<DataResponse<TemplateDetail>>(
      "/workout-templates",
      input,
    );
    return response.data.data;
  },

  async update(id: string, input: TemplateInput) {
    const response = await axiosInstance.patch<DataResponse<TemplateDetail>>(
      "/workout-templates/" + id,
      input,
    );
    return response.data.data;
  },

  async remove(id: string) {
    await axiosInstance.delete("/workout-templates/" + id);
  },
};

const exercisePath = (workoutId: string, exerciseId: string) =>
  "/workouts/" + workoutId + "/exercises/" + exerciseId;

export const workoutsService = {
  async list(page = 0) {
    const response = await axiosInstance.get<DataResponse<Paginated<Workout>>>("/workouts", {
      params: { page, size: 20 },
    });
    return response.data.data;
  },
  async active() {
    const response =
      await axiosInstance.get<DataResponse<WorkoutDetail | null>>("/workouts/active");
    return response.data.data;
  },
  async get(id: string) {
    const response = await axiosInstance.get<DataResponse<WorkoutDetail>>("/workouts/" + id);
    return response.data.data;
  },
  async start(templateId: string) {
    const response = await axiosInstance.post<DataResponse<WorkoutDetail>>("/workouts/start", {
      templateId,
    });
    return response.data.data;
  },
  async finish(id: string) {
    const response = await axiosInstance.post<DataResponse<WorkoutDetail>>(
      "/workouts/" + id + "/finish",
    );
    return response.data.data;
  },
  async skipExercise(id: string, exerciseId: string) {
    const response = await axiosInstance.post<DataResponse<WorkoutDetail>>(
      exercisePath(id, exerciseId) + "/skip",
    );
    return response.data.data;
  },
  async addSet(id: string, exerciseId: string) {
    const response = await axiosInstance.post<DataResponse<WorkoutSet>>(
      exercisePath(id, exerciseId) + "/sets",
    );
    return response.data.data;
  },
  async deleteSet(id: string, exerciseId: string, setId: string) {
    await axiosInstance.delete(exercisePath(id, exerciseId) + "/sets/" + setId);
  },
  async saveSet(id: string, exerciseId: string, setId: string, input: SetInput) {
    const response = await axiosInstance.patch<DataResponse<WorkoutSet>>(
      exercisePath(id, exerciseId) + "/sets/" + setId,
      input,
    );
    return response.data.data;
  },
};
