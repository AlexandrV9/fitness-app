import { serve } from "@hono/node-server";

import { app } from "./app.js";
import { config } from "./config/index.js";
import { checkDatabaseConnection } from "./database/index.js";

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
