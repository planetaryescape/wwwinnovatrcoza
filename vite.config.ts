import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

function manualChunks(id: string) {
  const normalizedId = id.replaceAll("\\", "/");
  if (!normalizedId.includes("node_modules")) return;
  if (normalizedId.includes("@stripe")) {
    return "vendor-payments";
  }
  if (/node_modules\/(react|react-dom|scheduler|wouter)\//.test(normalizedId) || normalizedId.includes("@tanstack/react-query")) {
    return "vendor-react";
  }
  if (normalizedId.includes("recharts") || normalizedId.includes("d3-")) {
    return "vendor-charts";
  }
  if (normalizedId.includes("@radix-ui") || normalizedId.includes("cmdk") || normalizedId.includes("vaul")) {
    return "vendor-ui";
  }
  if (normalizedId.includes("framer-motion")) {
    return "vendor-motion";
  }
}

export default defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer(),
          ),
          await import("@replit/vite-plugin-dev-banner").then((m) =>
            m.devBanner(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks,
      },
    },
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
