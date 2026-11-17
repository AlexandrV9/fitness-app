import { createRoute, z } from "@hono/zod-openapi";

export const AuthUserSchema = z
  .object({
    id: z.uuid(),
    login: z.string(),
  })
  .openapi("AuthUser");

export const AuthSessionSchema = z
  .object({
    accessToken: z.string(),
    refreshToken: z.string(),
    user: AuthUserSchema,
  })
  .openapi("AuthSession");

export const AuthSuccessSchema = z
  .object({
    success: z.literal(true),
    data: AuthSessionSchema,
  })
  .openapi("AuthSuccess");

export const ErrorCodeSchema = z
  .object({
    code: z.string(),
  })
  .openapi("ErrorCode");

export const SignInBodySchema = z
  .object({
    login: z.string().trim().min(1).max(254),
    password: z.string().min(8).max(128),
  })
  .openapi("SignInBody");

export const SignUpBodySchema = z
  .object({
    login: z.string().trim().min(1).max(64),
    password: z.string().min(8).max(128),
  })
  .openapi("SignUpBody");

export const RefreshBodySchema = z
  .object({
    refreshToken: z.string().min(1).max(4096),
  })
  .openapi("RefreshBody");

const jsonBody = <T extends z.ZodType>(schema: T) => ({
  content: {
    "application/json": {
      schema,
    },
  },
});

const jsonResponse = <T extends z.ZodType>(schema: T, description: string) => ({
  content: {
    "application/json": {
      schema,
    },
  },
  description,
});

export const signUpRoute = createRoute({
  method: "post",
  path: "/sign-up",
  tags: ["Auth"],
  summary: "Register a new user",
  request: {
    body: {
      required: true,
      ...jsonBody(SignUpBodySchema),
    },
  },
  responses: {
    201: jsonResponse(AuthSuccessSchema, "User created and session issued"),
    400: jsonResponse(ErrorCodeSchema, "Invalid auth data or weak password"),
    409: jsonResponse(ErrorCodeSchema, "Login already exists"),
  },
});

export const signInRoute = createRoute({
  method: "post",
  path: "/sign-in",
  tags: ["Auth"],
  summary: "Sign in with login and password",
  request: {
    body: {
      required: true,
      ...jsonBody(SignInBodySchema),
    },
  },
  responses: {
    200: jsonResponse(AuthSuccessSchema, "Session issued"),
    400: jsonResponse(ErrorCodeSchema, "Invalid auth data"),
    401: jsonResponse(ErrorCodeSchema, "Invalid credentials"),
  },
});

export const refreshRoute = createRoute({
  method: "post",
  path: "/refresh",
  tags: ["Auth"],
  summary: "Refresh access and refresh tokens",
  request: {
    body: {
      required: true,
      ...jsonBody(RefreshBodySchema),
    },
  },
  responses: {
    200: jsonResponse(AuthSuccessSchema, "New session tokens"),
    400: jsonResponse(ErrorCodeSchema, "Invalid auth data"),
    401: jsonResponse(ErrorCodeSchema, "Invalid refresh token"),
  },
});

export const logoutRoute = createRoute({
  method: "post",
  path: "/logout",
  tags: ["Auth"],
  summary: "Revoke the current refresh session",
  request: {
    body: {
      required: true,
      ...jsonBody(RefreshBodySchema),
    },
  },
  responses: {
    204: {
      description: "Session revoked",
    },
    400: jsonResponse(ErrorCodeSchema, "Invalid auth data"),
  },
});
