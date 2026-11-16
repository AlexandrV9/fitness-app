import { Hono } from "hono";

import { createAuthRouter } from "./modules/auth/presentation/createAuthRouter.js";
import { mapAuthError } from "./modules/auth/presentation/mapAuthError.js";
import { createExercisesRouter } from "./modules/exercises/presentation/createExercisesRouter.js";
import { createUsersRouter } from "./modules/users/presentation/createUsersRouter.js";
import { mapUserError } from "./modules/users/presentation/mapUserError.js";
import { createWorkoutsRouter } from "./modules/workouts/presentation/createWorkoutsRouter.js";
import { createWorkoutTemplatesRouter } from "./modules/workouts/presentation/createWorkoutTemplatesRouter.js";
import { mapWorkoutError } from "./modules/workouts/presentation/utils/mapWorkoutError.js";
import { errorHandler } from "./shared/lib/error-handler.js";

export const app = new Hono();

app.onError((error, c) => errorHandler(mapAuthError(mapUserError(mapWorkoutError(error))), c));
app.get("/", (c) => c.text("Hello Hono!"));

app.route("/auth", createAuthRouter());
app.route("/users", createUsersRouter());
app.route("/exercises", createExercisesRouter());
app.route("/workout-templates", createWorkoutTemplatesRouter());
app.route("/workouts", createWorkoutsRouter());
