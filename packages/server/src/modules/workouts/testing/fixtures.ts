import type { WorkoutTemplateDetailDto } from "../domain/interfaces/template/TemplateDetailDto.js";
import type { WorkoutDetailDto } from "../domain/interfaces/workout/WorkoutDetailDto.js";

export const userId = "user-1";

export const workout: WorkoutDetailDto = {
  id: "workout-1",
  userId,
  templateId: "template-1",
  templateName: "Leg day",
  startedAt: new Date("2026-01-01T09:00:00Z"),
  finishedAt: null,
  exercises: [
    {
      id: "workout-exercise-1",
      exerciseId: "exercise-1",
      name: "Squat",
      position: 1,
      isSkipped: false,
      parameterSchema: [{ key: "reps", type: "integer", min: 1 }],
      sets: [{ id: "set-1", setNumber: 1, status: "pending", parameterValues: {} }],
    },
  ],
};

export const template: WorkoutTemplateDetailDto = {
  id: "template-1",
  userId,
  name: "Leg day",
  exercises: [
    {
      id: "template-exercise-1",
      exerciseId: "exercise-1",
      name: "Squat",
      position: 1,
      plannedSets: 3,
    },
  ],
};

export const templateInput = {
  name: "Leg day",
  exercises: [{ exerciseId: "exercise-1", plannedSets: 3 }],
};
