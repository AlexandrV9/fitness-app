import { serve } from "@hono/node-server";

import { app } from "./app.js";
import { config } from "./config/index.js";
import { checkDatabaseConnection } from "~/database/index.js";

const { accessToken, refreshToken } = config.auth;
if (
  !accessToken.secret?.trim() ||
  !refreshToken.secret?.trim() ||
  accessToken.secret === refreshToken.secret
) {
  throw new Error("Set distinct ACCESS_TOKEN_SECRET and REFRESH_TOKEN_SECRET values");
}

await checkDatabaseConnection();

serve(
  {
    fetch: app.fetch,
    port: config.app.serverPort,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  },
);
