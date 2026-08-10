import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const SERVER = `http://localhost:${process.env.SERVER_PORT ?? 8787}`;

export default defineConfig({
  plugins: [react()],
  server: {
    // Honour an injected PORT so this can run alongside other dev servers.
    port: Number(process.env.PORT) || 5173,
    proxy: {
      "/api": { target: SERVER, changeOrigin: true },
      "/ws": { target: SERVER, ws: true, changeOrigin: true },
    },
  },
  build: { outDir: "dist" },
});
