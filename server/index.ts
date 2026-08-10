// Must be first: it populates process.env from .env before anything reads it.
import "./env.ts";

import http from "node:http";
import { WebSocketServer } from "ws";

import type { ClientEvent } from "../shared/protocol.ts";
import { Hub } from "./hub.ts";
import { hasBuild, serveStatic } from "./static.ts";

// In dev the dev script sets SERVER_PORT explicitly, because `PORT` there
// belongs to Vite. In production this is the only server, and `PORT` is what
// hosting platforms inject.
const PORT = Number(process.env.SERVER_PORT ?? process.env.PORT ?? 8787);
// 0.0.0.0 so a tunnel or a container can reach it, not just this machine.
const HOST = process.env.HOST ?? "0.0.0.0";
const hub = new Hub();

const server = http.createServer((req, res) => {
  const url = new URL(req.url ?? "/", `http://${req.headers.host}`);

  const json = (status: number, body: unknown) => {
    const payload = JSON.stringify(body);
    res.writeHead(status, {
      "content-type": "application/json",
      "content-length": Buffer.byteLength(payload),
    });
    res.end(payload);
  };

  if (url.pathname === "/api/sessions" && req.method === "GET") {
    return json(200, {
      mock: hub.mock,
      model: hub.model,
      sessions: hub.list().map((s) => s.summary()),
    });
  }

  if (url.pathname === "/api/sessions" && req.method === "POST") {
    return json(201, hub.create().summary());
  }

  if (serveStatic(req, res, url.pathname)) return;
  json(404, { error: "not found" });
});

const wss = new WebSocketServer({ server, path: "/ws" });

wss.on("connection", (socket) => {
  let session: ReturnType<Hub["getOrCreate"]> | null = null;
  let participantId: string | null = null;

  socket.on("message", (raw) => {
    let event: ClientEvent;
    try {
      event = JSON.parse(raw.toString()) as ClientEvent;
    } catch {
      return;
    }

    // The first frame must be `hello`; everything else is refused until then.
    if (event.t === "hello") {
      if (session) return;
      session = hub.getOrCreate(event.sessionId);
      participantId = session.attach(socket, event.name, event.participantId, event.since).id;
      return;
    }
    if (!session || !participantId) return;

    switch (event.t) {
      case "say":
        session.say(participantId, event.text);
        break;
      case "steer":
        session.steer(participantId, event.text);
        break;
      case "interrupt":
        session.interrupt(participantId);
        break;
      case "typing":
        session.setTyping(participantId, event.typing);
        break;
      case "decide":
        session.decide(participantId, event.entryId, event.approve);
        break;
      case "rename":
        session.rename(participantId, event.name);
        break;
    }
  });
});

// A port clash is the most common way this fails to start, usually because an
// earlier copy is still running. Say that, instead of printing a stack trace.
const onListenError = (error: NodeJS.ErrnoException) => {
  if (error.code !== "EADDRINUSE") throw error;
  console.error(
    `\n[server] Port ${PORT} is already in use.\n` +
      `         Another copy of the server is probably still running. Stop it, or\n` +
      `         start this one elsewhere:  SERVER_PORT=8788 npm run dev\n`,
  );
  process.exit(1);
};
server.on("error", onListenError);
wss.on("error", onListenError);

server.listen(PORT, HOST, () => {
  console.log(`[server] multiplayergpt listening on http://localhost:${PORT}`);
  console.log(
    hasBuild
      ? "[server] serving the built client from dist/ - this port is all you need to share"
      : "[server] no dist/ build found; expecting the Vite dev server to serve the client",
  );
});
