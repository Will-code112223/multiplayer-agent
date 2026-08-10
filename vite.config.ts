import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const SERVER = `http://localhost:${process.env.SERVER_PORT ?? 8787}`;

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": { target: SERVER, changeOrigin: true },
      "/ws": { target: SERVER, ws: true, changeOrigin: true },
    },
  },
  build: { outDir: "dist" },
});
