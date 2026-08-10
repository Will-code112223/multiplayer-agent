/**
 * Loads `.env` before anything reads `process.env`.
 *
 * Import this first in the entrypoint - ES modules evaluate in import order, so
 * putting it above the other imports guarantees the agent driver sees the key.
 *
 * The key stays on the server. Nothing here reaches the browser: the client
 * talks only to this server, and this server talks to Anthropic. Never move the
 * key into anything under `web/` - Vite inlines that into the JS bundle, where
 * anyone who opens the page can read it.
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
 * present it.
 *
 * This is the only real access control in the app. Roles are a UX affordance
 * that any participant can change for themselves; this is the gate that
 * actually keeps strangers out of a session that spends your API credits.
 */
export const ACCESS_CODE = process.env.ACCESS_CODE?.trim() || null;
