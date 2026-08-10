/**
 * Roles, agent config, and the workspace API, against the mock agent.
 *
 *   node test/features.mjs
 */
import { spawn } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";

const PORT = 8801;
const BASE = `http://localhost:${PORT}`;
const SESSION = `feat-${Date.now().toString(36)}`;

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

const hello = (sessionId, name, role, id) =>
  JSON.stringify({ t: "hello", sessionId, name, color: 0, role, participantId: id });

const server = spawn("npx", ["tsx", "server/index.ts"], {
  env: { ...process.env, SERVER_PORT: String(PORT), ANTHROPIC_API_KEY: "" },
  stdio: ["ignore", "pipe", "inherit"],
});
process.on("exit", () => server.kill());

await new Promise((resolve, reject) => {
  const timer = setTimeout(() => reject(new Error("server did not start")), 20_000);
  server.stdout.on("data", (buf) => {
    if (buf.toString().includes("listening")) {
      clearTimeout(timer);
      resolve();
    }
  });
});

try {
  // ---------------------------------------------------------------- roles ---
  const watcherEvents = [];
  const watcher = await open((e) => watcherEvents.push(e));
  watcher.send(hello(SESSION, "Watcher", "observer", "obs"));
  await delay(250);

  watcher.send(JSON.stringify({ t: "say", text: "let me in" }));
  await delay(300);

  check(
    "observer's message is refused",
    watcherEvents.some((e) => e.t === "denied"),
    watcherEvents.find((e) => e.t === "denied")?.reason ?? "no denied event",
  );
  check(
    "observer's message never reaches the transcript",
    !watcherEvents.some((e) => e.t === "entry.add" && e.entry.kind === "user"),
  );
  check(
    "a denied event does not rewind the client's cursor",
    watcherEvents.filter((e) => e.t === "denied").every((e) => e.seq > 0),
  );

  watcher.send(JSON.stringify({ t: "setRole", role: "participant" }));
  await delay(250);
  const promoted = watcherEvents
    .filter((e) => e.t === "presence")
    .at(-1)
    ?.participants.find((p) => p.id === "obs");
  check("an observer can switch to participant", promoted?.role === "participant");

  // --------------------------------------------------------------- config ---
  const driverEvents = [];
  const driver = await open((e) => driverEvents.push(e));
  driver.send(hello(SESSION, "Driver", "participant", "drv"));
  await delay(250);

  driver.send(JSON.stringify({ t: "setConfig", config: { model: "gpt-4-turbo" } }));
  await delay(250);
  check(
    "an unlisted model is refused",
    driverEvents.some((e) => e.t === "denied" && /Unknown model/.test(e.reason)),
  );

  driver.send(JSON.stringify({ t: "setConfig", config: { model: "claude-haiku-4-5" } }));
  await delay(250);
  const cfg = driverEvents.filter((e) => e.t === "config").at(-1);
  check("an allowlisted model is accepted", cfg?.config.model === "claude-haiku-4-5");
  check(
    "the switch is recorded in the transcript with the cache cost",
    driverEvents.some(
      (e) => e.t === "entry.add" && e.entry.kind === "system" && /resets the prompt cache/.test(e.entry.text),
    ),
  );

  // Start a turn, then try to change settings mid-flight.
  driver.send(JSON.stringify({ t: "say", text: "Write up the migration plan for billing" }));
  for (let i = 0; i < 60; i++) {
    await delay(100);
    if (driverEvents.some((e) => e.t === "run" && e.run.status !== "idle")) break;
  }
  const before = driverEvents.filter((e) => e.t === "denied").length;
  driver.send(JSON.stringify({ t: "setConfig", config: { model: "claude-opus-5" } }));
  await delay(300);
  check(
    "settings are refused while the agent is working",
    driverEvents.filter((e) => e.t === "denied").length > before,
  );

  // ------------------------------------------------------------ workspace ---
  // The mock proposes a write for longer asks; approve it so a file exists.
  for (let i = 0; i < 80; i++) {
    await delay(100);
    if (driverEvents.some((e) => e.t === "entry.add" && e.entry.kind === "tool")) break;
  }
  const toolEntry = driverEvents.find((e) => e.t === "entry.add" && e.entry.kind === "tool")?.entry;
  check("the agent proposed a tool call", Boolean(toolEntry));
  if (toolEntry) {
    driver.send(JSON.stringify({ t: "decide", entryId: toolEntry.id, approve: true }));
  }
  for (let i = 0; i < 80; i++) {
    await delay(100);
    if (driverEvents.some((e) => e.t === "files" && e.files.length > 0)) break;
  }

  check(
    "a files event fires when the workspace changes",
    driverEvents.some((e) => e.t === "files" && e.files.length > 0),
  );

  const listed = await (await fetch(`${BASE}/api/sessions/${SESSION}/files`)).json();
  check("the file API lists the written file", listed.files?.length > 0, JSON.stringify(listed.files));

  if (listed.files?.length) {
    const body = await (
      await fetch(`${BASE}/api/sessions/${SESSION}/files/${listed.files[0].path}`)
    ).text();
    check("the file API returns its contents", body.includes("Session notes"));
  }

  const traversal = await fetch(`${BASE}/api/sessions/${SESSION}/files/..%2f..%2f..%2f.env`);
  check("the file API blocks traversal", traversal.status === 404, `status ${traversal.status}`);

  const missingSession = await fetch(`${BASE}/api/sessions/does-not-exist`);
  check("an unknown session is a 404", missingSession.status === 404);

  for (const s of [watcher, driver]) s.close();
} finally {
  server.kill();
}

console.log(failures === 0 ? "\nall checks passed" : `\n${failures} check(s) failed`);
process.exit(failures === 0 ? 0 : 1);
