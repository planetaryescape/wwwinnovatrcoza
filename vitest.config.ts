import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

process.env.DATABASE_URL ??=
  "postgres://dig:dig@localhost:57432/dig?options=--search_path%3Dpublic";
process.env.DIG_IN_CONTAINER ??= "1";
process.env.DIG_ETL_SERVICE_TOKEN ??= "test-service-token";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  test: {
    environment: "node",
    sequence: { concurrent: false },
    fileParallelism: false,
    testTimeout: 60_000,
    hookTimeout: 60_000,
  },
});
