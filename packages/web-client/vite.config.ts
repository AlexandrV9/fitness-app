import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, loadEnv } from "vite";

const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const apiEndpoint = env.VITE_API_ENDPOINT || "http://localhost:8000";

  return {
    plugins: [
      tanstackRouter({
        target: "react",
        routeFileIgnorePattern: "^_(ui|layout|pages)$",
        autoCodeSplitting: true,
      }),
      react(),
    ],
    resolve: {
      alias: {
        "~": path.resolve(rootDir, "src"),
      },
    },
    server: {
      port: 3000,
      proxy: {
        "/api": {
          target: apiEndpoint,
          changeOrigin: true,
          rewrite: (requestPath) => requestPath.replace(/^\/api/, ""),
        },
      },
    },
  };
});
