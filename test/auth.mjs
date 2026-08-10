/**
 * The shared access code gates both the REST API and the WebSocket.
 *
 *   node test/auth.mjs
 */
import { spawn } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";

const PORT = 8805, BASE = `http://localhost:${PORT}`, CODE = "hunter2";
let fail = 0;
const check = (l, ok, d = "") => { console.log(`${ok ? "  ok  " : " FAIL "} ${l}${d ? `  (${d})` : ""}`); if (!ok) fail++; };

const server = spawn("npx", ["tsx", "server/index.ts"], {
  env: { ...process.env, SERVER_PORT: String(PORT), ANTHROPIC_API_KEY: "", ACCESS_CODE: CODE },
  stdio: ["ignore", "pipe", "inherit"],
});
process.on("exit", () => server.kill());
await new Promise((res, rej) => {
  const t = setTimeout(() => rej(new Error("no start")), 20000);
  server.stdout.on("data", (b) => { if (b.toString().includes("listening")) { clearTimeout(t); res(); } });
});

try {
  const cfg = await (await fetch(`${BASE}/api/config`)).json();
  check("config advertises that a code is required", cfg.authRequired === true);
  check("config never leaks the code itself", !JSON.stringify(cfg).includes(CODE), JSON.stringify(cfg));

  check("api without a code is 401", (await fetch(`${BASE}/api/sessions`)).status === 401);
  check("api with a wrong code is 401",
    (await fetch(`${BASE}/api/sessions`, { headers: { "x-access-code": "nope" } })).status === 401);
  check("api with the right code is 200",
    (await fetch(`${BASE}/api/sessions`, { headers: { "x-access-code": CODE } })).status === 200);

  const tryWs = (code) => new Promise((resolve) => {
    const ws = new WebSocket(`ws://localhost:${PORT}/ws`);
    let got = null;
    ws.addEventListener("message", (e) => { got = JSON.parse(e.data).t; ws.close(); });
    ws.addEventListener("close", (e) => resolve({ closeCode: e.code, first: got }));
    ws.addEventListener("open", () => ws.send(JSON.stringify({
      t: "hello", sessionId: "authtest", name: "X", color: 0, role: "participant", participantId: "x", ...(code ? { code } : {}),
    })));
    setTimeout(() => { try { ws.close(); } catch {} }, 4000);
  });

  const bad = await tryWs("wrong");
  check("websocket rejects a wrong code with 4001", bad.closeCode === 4001, JSON.stringify(bad));
  const none = await tryWs(null);
  check("websocket rejects a missing code", none.closeCode === 4001, JSON.stringify(none));
  const good = await tryWs(CODE);
  check("websocket accepts the right code", good.first === "snapshot", JSON.stringify(good));
} finally { server.kill(); }
console.log(fail === 0 ? "\nall checks passed" : `\n${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
