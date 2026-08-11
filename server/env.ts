/**
 * Loads `.env` before anything reads `process.env`.
 *
 * Import this first in the entrypoint: ES modules evaluate in import order.
 *
 * The API key stays server-side. Never move it under `web/` - Vite inlines
 * that into the browser bundle.
 */
import fs from "node:fs";
import path from "node:path";

const envFile = path.resolve(process.cwd(), ".env");

if (fs.existsSync(envFile)) {
  try {
    // Node 20.6+ parses .env natively; no dependency needed.
    process.loadEnvFile(envFile);
    console.log("[env] loaded .env");
  } catch (error) {
    console.warn(`[env] could not read .env: ${error instanceof Error ? error.message : error}`);
  }
}

/**
 * Optional shared passcode. When set, every API call and WebSocket join must
 * present it. This is the only real access control; roles are not.
 */
export const ACCESS_CODE = process.env.ACCESS_CODE?.trim() || null;
