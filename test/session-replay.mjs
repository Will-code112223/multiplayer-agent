/**
 * End-to-end check of the session protocol's core promise: a client that drops
 * its socket and reconnects with its last cursor reconstructs exactly the
 * transcript it would have had if it never disconnected.
 *
 * Runs against the scripted mock agent, so it needs no credentials.
 *
 *   node test/session-replay.mjs
 */
import { spawn } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";

const PORT = 8799;
const WS = `ws://localhost:${PORT}/ws`;
const SESSION = `replay-${Date.now().toString(36)}`;

let failures = 0;
const check = (label, ok, detail = "") => {
  console.log(`${ok ? "  ok  " : " FAIL "} ${label}${detail ? `  (${detail})` : ""}`);
  if (!ok) failures++;
};

function open(onEvent) {
  const socket = new WebSocket(WS);
  socket.addEventListener("message", (ev) => onEvent(JSON.parse(ev.data)));
  return new Promise((resolve, reject) => {
    socket.addEventListener("open", () => resolve(socket));
    socket.addEventListener("error", reject);
  });
}

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
  // A joins, notes its cursor, then drops.
  const aFirst = [];
  const a1 = await open((e) => aFirst.push(e));
  a1.send(JSON.stringify({ t: "hello", sessionId: SESSION, name: "A", participantId: "pa" }));
  await delay(250);
  check("a new client receives a snapshot", aFirst[0]?.t === "snapshot", aFirst[0]?.t);
  const cursor = aFirst.at(-1).seq;
  a1.close();
  await delay(150);

  // B runs a full agent turn while A is away. The prompt is short on purpose:
  // the mock only proposes a tool for longer asks, so this turn runs to completion.
  const bEvents = [];
  const b = await open((e) => bEvents.push(e));
  b.send(JSON.stringify({ t: "hello", sessionId: SESSION, name: "B", participantId: "pb" }));
  await delay(150);
  b.send(JSON.stringify({ t: "say", text: "hi there" }));
  for (let i = 0; i < 80 && !bEvents.some((e) => e.t === "run" && e.run.status === "idle"); i++) {
    await delay(100);
  }
  check(
    "agent completed a turn while A was disconnected",
    bEvents.some((e) => e.t === "entry.add" && e.entry.kind === "agent"),
  );

  // A reconnects with its cursor.
  const aReplay = [];
  const a2 = await open((e) => aReplay.push(e));
  a2.send(
    JSON.stringify({ t: "hello", sessionId: SESSION, name: "A", participantId: "pa", since: cursor }),
  );
  await delay(400);

  check("reconnect replays the gap instead of re-snapshotting", !aReplay.some((e) => e.t === "snapshot"));
  check(
    "replay includes the message sent while away",
    aReplay.some((e) => e.t === "entry.add" && e.entry.kind === "user" && e.entry.text === "hi there"),
  );
  check(
    "replay includes the agent's reply",
    aReplay.some((e) => e.t === "entry.add" && e.entry.kind === "agent"),
  );
  check("replay redelivers nothing already seen", aReplay.every((e) => e.seq > cursor));

  // A fresh client's snapshot is ground truth for what A should now hold.
  const cEvents = [];
  const c = await open((e) => cEvents.push(e));
  c.send(JSON.stringify({ t: "hello", sessionId: SESSION, name: "C", participantId: "pc" }));
  await delay(300);

  const truth = cEvents.find((e) => e.t === "snapshot").session.entries.map((e) => e.id);
  const rebuilt = [
    ...aFirst.find((e) => e.t === "snapshot").session.entries.map((e) => e.id),
    ...aFirst.filter((e) => e.t === "entry.add").map((e) => e.entry.id),
    ...aReplay.filter((e) => e.t === "entry.add").map((e) => e.entry.id),
  ];
  check(
    "reconnected client reconstructs the authoritative transcript",
    JSON.stringify(rebuilt.slice(0, truth.length)) === JSON.stringify(truth),
    `rebuilt=[${rebuilt}] truth=[${truth}]`,
  );
  check("no duplicated entries after replay", new Set(rebuilt).size === rebuilt.length);

  // A cursor the server can no longer serve must still converge, via snapshot.
  const dEvents = [];
  const d = await open((e) => dEvents.push(e));
  d.send(
    JSON.stringify({ t: "hello", sessionId: SESSION, name: "D", participantId: "pd", since: 10 ** 9 }),
  );
  await delay(300);
  check(
    "an unservable cursor falls back to a snapshot",
    dEvents.some((e) => e.t === "snapshot"),
  );

  for (const s of [b, a2, c, d]) s.close();
} finally {
  server.kill();
}

console.log(failures === 0 ? "\nall checks passed" : `\n${failures} check(s) failed`);
process.exit(failures === 0 ? 0 : 1);
