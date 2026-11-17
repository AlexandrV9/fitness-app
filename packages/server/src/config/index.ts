export const config = {
  app: {
    clientPort: Number(process.env.CLIENT_PORT) || 3000,
    serverPort: Number(process.env.SERVER_PORT) || 8000,
    isDev: process.env.NODE_ENV === "development",
  },
  auth: {
    accessToken: {
      expInSec: 60 * 3, // 3 minutes
      secret: process.env.ACCESS_TOKEN_SECRET!,
    },
    refreshToken: {
      expInSec: 60 * 60 * 24 * 7, // 7 days
      cookie: "refresh_token",
      secret: process.env.REFRESH_TOKEN_SECRET!,
    },
    resetPasswordToken: {
      secret: process.env.RESET_PASSWORD_TOKEN_SECRET!,
    },
  },
  clientUrl: process.env.CLIENT_URL || "http://localhost:3000",
  db: {
    host: process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || "fitness-app",
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  },
  cors: {
    allowedOrigins: process.env.ALLOWED_ORIGINS?.split(",")
      .map((origin) => origin.trim())
      .filter(Boolean) || [process.env.CLIENT_URL || "http://localhost:3000"],
  },
} as const;
