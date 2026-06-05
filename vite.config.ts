import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    outDir: "dist",
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          const normalizedId = id.replace(/\\/g, "/");
          if (normalizedId.includes("node_modules")) {
            if (normalizedId.includes("/react/") || normalizedId.includes("/react-dom/") || normalizedId.includes("/scheduler/"))
              return "react";
            if (
              normalizedId.includes("/d3-force/") ||
              normalizedId.includes("/d3-quadtree/") ||
              normalizedId.includes("/d3-dispatch/") ||
              normalizedId.includes("/d3-timer/")
            )
              return "d3-force";
            if (normalizedId.includes("/d3-") || normalizedId.includes("/topojson-")) return "d3";
            if (normalizedId.includes("/world-atlas/") || normalizedId.includes("/react-simple-maps/")) return "map";
          }
        },
      },
    },
  },
  test: {
    environment: "jsdom",
    exclude: ["tests/e2e/**", "node_modules/**", "dist/**"],
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
  },
});
