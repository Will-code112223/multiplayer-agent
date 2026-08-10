/**
 * A session must survive the server process that created it.
 *
 *   node test/persistence.mjs
 */
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { setTimeout as delay } from "node:timers/promises";

const PORT = 8802;
const SESSION = `persist-${Date.now().toString(36)}`;
const DATA_FILE = path.resolve(process.cwd(), "data", "sessions", `${SESSION}.json`);

let failures = 0;
const check = (label, ok, detail = "") => {
  console.log(`${ok ? "  ok  " : " FAIL "} ${label}${detail ? `  (${detail})` : ""}`);
  if (!ok) failures++;
};

function open(onEvent) {
  const socket = new WebSocket(`ws://localhost:${PORT}/ws`);
  socket.addEventListener("message", (ev) => onEvent(JSON.parse(ev.data)));
  return new Promise((resolve, reject) => {
    socket.addEventListener("open", () => resolve(socket));
    socket.addEventListener("error", reject);
  });
}

function startServer() {
  const proc = spawn("npx", ["tsx", "server/index.ts"], {
    env: { ...process.env, SERVER_PORT: String(PORT), ANTHROPIC_API_KEY: "" },
    stdio: ["ignore", "pipe", "inherit"],
  });
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("server did not start")), 20_000);
    proc.stdout.on("data", (buf) => {
      if (buf.toString().includes("listening")) {
        clearTimeout(timer);
        resolve(proc);
      }
    });
  });
}

async function stopServer(proc) {
  // SIGTERM, not SIGKILL: the flush-on-exit path is part of what's under test.
  proc.kill("SIGTERM");
  await delay(1200);
}

let server = await startServer();
process.on("exit", () => server?.kill());

try {
  // ------------------------------------------------- first process: talk ---
  const first = [];
  const a = await open((e) => first.push(e));
  a.send(
    JSON.stringify({
      t: "hello",
      sessionId: SESSION,
      name: "Ada",
      color: 3,
      role: "participant",
      participantId: "ada",
    }),
  );
  await delay(250);
  a.send(JSON.stringify({ t: "say", text: "hi there" }));

  for (let i = 0; i < 80; i++) {
    await delay(100);
    if (first.some((e) => e.t === "run" && e.run.status === "idle" && i > 4)) break;
  }
  const beforeIds = first
    .filter((e) => e.t === "entry.add")
    .map((e) => e.entry.id);
  check("a turn completed before the restart", beforeIds.length >= 3, `${beforeIds.length} entries`);
  a.close();

  await stopServer(server);
  check("the session was written to disk", fs.existsSync(DATA_FILE), DATA_FILE);

  // -------------------------------------------- second process: restored ---
  server = await startServer();

  const second = [];
  const b = await open((e) => second.push(e));
  b.send(
    JSON.stringify({
      t: "hello",
      sessionId: SESSION,
      name: "Ada",
      color: 3,
      role: "participant",
      participantId: "ada",
    }),
  );
  await delay(400);

  const snapshot = second.find((e) => e.t === "snapshot");
  check("the restarted server has the session", Boolean(snapshot));

  const restoredIds = (snapshot?.session.entries ?? []).map((e) => e.id);
  check(
    "the transcript survived the restart",
    beforeIds.every((id) => restoredIds.includes(id)),
    `${restoredIds.length} restored vs ${beforeIds.length} before`,
  );
  check(
    "the user's message survived",
    (snapshot?.session.entries ?? []).some((e) => e.kind === "user" && e.text === "hi there"),
  );
  check(
    "the agent's reply survived",
    (snapshot?.session.entries ?? []).some((e) => e.kind === "agent" && e.text.length > 0),
  );
  check("the returning participant kept their colour", snapshot?.you.color === 3);
  check("no entry is left mid-stream",
    !(snapshot?.session.entries ?? []).some((e) => e.kind === "agent" && e.status === "streaming"));
  check("run state resets to idle", snapshot?.session.run.status === "idle");

  // The conversation must still be usable, not just displayable.
  b.send(JSON.stringify({ t: "say", text: "and again" }));
  for (let i = 0; i < 80; i++) {
    await delay(100);
    if (second.some((e) => e.t === "entry.add" && e.entry.kind === "agent")) break;
  }
  check(
    "the restored session can still run a turn",
    second.some((e) => e.t === "entry.add" && e.entry.kind === "agent"),
  );
  check(
    "restored entry ids do not collide with new ones",
    new Set(second.filter((e) => e.t === "entry.add").map((e) => e.entry.id)).size ===
      second.filter((e) => e.t === "entry.add").length,
  );

  b.close();
} finally {
  server?.kill();
  await delay(300);
  fs.rmSync(DATA_FILE, { force: true });
  fs.rmSync(path.resolve(process.cwd(), "workspace", SESSION), { recursive: true, force: true });
}

console.log(failures === 0 ? "\nall checks passed" : `\n${failures} check(s) failed`);
process.exit(failures === 0 ? 0 : 1);
