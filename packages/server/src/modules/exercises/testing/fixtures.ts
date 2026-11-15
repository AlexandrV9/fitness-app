import type { IExercise } from "../domain/interfaces/IExercise.js";

export const userId = "user-1";

export const exercise: IExercise = {
  id: "exercise-1",
  userId,
  name: "Bench Press",
  parameterSchema: [{ key: "weight_kg", type: "number" }],
};

export const createExerciseRequest = {
  name: exercise.name,
  parameterSchema: exercise.parameterSchema,
};

export const updateExerciseRequest = {
  id: exercise.id,
};

export const updatedExerciseName = "Incline Bench Press";
