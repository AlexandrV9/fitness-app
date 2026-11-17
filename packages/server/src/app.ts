import { swaggerUI } from "@hono/swagger-ui";
import { OpenAPIHono } from "@hono/zod-openapi";
import { cors } from "hono/cors";

import { config } from "./config/index.js";
import { createAuthRouter } from "~/modules/auth/presentation/createAuthRouter.js";
import { createExercisesRouter } from "~/modules/exercises/presentation/createExercisesRouter.js";
import { createUsersRouter } from "~/modules/users/presentation/createUsersRouter.js";
import { createWorkoutsRouter } from "~/modules/workouts/presentation/createWorkoutsRouter.js";
import { createWorkoutTemplatesRouter } from "~/modules/workouts/presentation/createWorkoutTemplatesRouter.js";
import { errorHandler } from "~/shared/lib/error-handler.js";
import { globalErrorMapper } from "~/shared/lib/error-mapper.js";

export const app = new OpenAPIHono();

app.use(
  "*",
  cors({
    origin: config.cors.allowedOrigins,
    allowHeaders: ["Authorization", "Content-Type"],
    allowMethods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  }),
);

app.onError((error, c) => errorHandler(globalErrorMapper.map(error), c));

app.get("/", (c) => c.text("Hello Hono!"));

app.route("/auth", createAuthRouter());
app.route("/users", createUsersRouter());
app.route("/exercises", createExercisesRouter());
app.route("/workout-templates", createWorkoutTemplatesRouter());
app.route("/workouts", createWorkoutsRouter());

app.doc31("/openapi.json", {
  openapi: "3.1.0",
  info: {
    title: "Fitness App API",
    version: "0.0.0",
  },
});

app.get("/docs", swaggerUI({ url: "/openapi.json" }));
