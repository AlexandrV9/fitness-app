import { Hono } from "hono";

import { createExercisesRouter } from "./modules/exercises/presentation/createExercisesRouter.js";
import { createWorkoutsRouter } from "./modules/workouts/presentation/createWorkoutsRouter.js";
import { createWorkoutTemplatesRouter } from "./modules/workouts/presentation/createWorkoutTemplatesRouter.js";
import { mapWorkoutError } from "./modules/workouts/presentation/utils/mapWorkoutError.js";
import { errorHandler } from "./shared/lib/error-handler.js";

export const app = new Hono();

app.onError((error, c) => errorHandler(mapWorkoutError(error), c));
app.get("/", (c) => c.text("Hello Hono!"));

app.route("/exercises", createExercisesRouter());
app.route("/workout-templates", createWorkoutTemplatesRouter());
app.route("/workouts", createWorkoutsRouter());
