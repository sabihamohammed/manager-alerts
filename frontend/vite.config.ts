/// <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173
  },

  // Vitest configuration - NOW recognized by Vite
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/test-setup.tsx"
  }
});
