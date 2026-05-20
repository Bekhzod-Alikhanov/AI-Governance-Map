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
          if (id.includes("node_modules")) {
            if (id.includes("/react/") || id.includes("/react-dom/") || id.includes("/scheduler/"))
              return "react";
            if (id.includes("/d3-") || id.includes("/topojson-")) return "d3";
            if (id.includes("/world-atlas/") || id.includes("/react-simple-maps/")) return "map";
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
