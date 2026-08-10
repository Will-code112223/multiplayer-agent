// Must be first: it populates process.env from .env before anything reads it.
import "./env.ts";

import http from "node:http";
import { timingSafeEqual } from "node:crypto";
import { WebSocketServer } from "ws";

import type { ClientEvent, Role } from "../shared/protocol.ts";
import { ACCESS_CODE } from "./env.ts";
import { Hub } from "./hub.ts";
import * as store from "./store.ts";
import { hasBuild, serveStatic } from "./static.ts";
import { listWorkspace, readWorkspaceFile } from "./workspace.ts";

// In dev the dev script sets SERVER_PORT explicitly, because `PORT` there
// belongs to Vite. In production this is the only server, and `PORT` is what
// hosting platforms inject.
const PORT = Number(process.env.SERVER_PORT ?? process.env.PORT ?? 8787);
// 0.0.0.0 so a tunnel or a container can reach it, not just this machine.
const HOST = process.env.HOST ?? "0.0.0.0";
const hub = new Hub();

/** Constant-time compare, so the code can't be recovered by timing the response. */
function codeMatches(candidate: string | null | undefined): boolean {
  if (!ACCESS_CODE) return true;
  if (!candidate) return false;
  const a = Buffer.from(candidate);
  const b = Buffer.from(ACCESS_CODE);
  return a.length === b.length && timingSafeEqual(a, b);
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", `http://${req.headers.host}`);

  const json = (status: number, body: unknown) => {
    const payload = JSON.stringify(body);
    res.writeHead(status, {
      "content-type": "application/json",
      "content-length": Buffer.byteLength(payload),
    });
    res.end(payload);
  };

  // Unauthenticated on purpose: the client needs to know whether to show the
  // code screen. It reveals that a code exists, never the code itself.
  if (url.pathname === "/api/config") {
    return json(200, {
      authRequired: Boolean(ACCESS_CODE),
      mock: hub.mock,
      models: hub.models,
      defaultModel: hub.defaultModel,
    });
  }

  if (url.pathname.startsWith("/api/")) {
    const supplied =
      (req.headers["x-access-code"] as string | undefined) ?? url.searchParams.get("code");
    if (!codeMatches(supplied)) return json(401, { error: "access code required" });

    if (url.pathname === "/api/sessions" && req.method === "GET") {
      return json(200, { mock: hub.mock, sessions: hub.list().map((s) => s.summary()) });
    }
    if (url.pathname === "/api/sessions" && req.method === "POST") {
      return json(201, hub.create().summary());
    }

    // /api/sessions/:id, /api/sessions/:id/files, /api/sessions/:id/files/<path>
    const parts = url.pathname.split("/").filter(Boolean); // ["api","sessions",id,...]
    if (parts[0] === "api" && parts[1] === "sessions" && parts[2]) {
      const session = hub.get(parts[2]);
      if (!session) return json(404, { error: "no such session" });

      if (parts.length === 3) return json(200, session.summary());

      if (parts[3] === "files") {
        if (parts.length === 4) return json(200, { files: await listWorkspace(session.id) });
        // The path guard lives in workspace.ts, so traversal is rejected in one
        // place rather than re-checked here.
        const rel = parts.slice(4).map(decodeURIComponent).join("/");
        try {
          const body = await readWorkspaceFile(session.id, rel);
          res.writeHead(200, {
            "content-type": "text/plain; charset=utf-8",
            "content-length": Buffer.byteLength(body),
          });
          return res.end(body);
        } catch (error) {
          return json(404, { error: error instanceof Error ? error.message : "not found" });
        }
      }
    }
    return json(404, { error: "not found" });
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
      if (!codeMatches(event.code)) {
        socket.close(4001, "access code required");
        return;
      }
      const role: Role = event.role === "observer" ? "observer" : "participant";
      session = hub.getOrCreate(event.sessionId);
      participantId = session.attach(socket, {
        name: (event.name || "Guest").slice(0, 32),
        color: Number(event.color) || 0,
        role,
        participantId: event.participantId,
        since: event.since,
      }).id;
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
        session.rename(participantId, event.name, event.color);
        break;
      case "setRole":
        session.setRole(participantId, event.role);
        break;
      case "setConfig":
        session.setConfig(participantId, event.config);
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

// Persistence is debounced, so a pending write has to be flushed on the way out
// or the last few seconds of a conversation are lost on Ctrl+C.
for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.on(signal, () => {
    store.flushAll();
    process.exit(0);
  });
}

server.listen(PORT, HOST, () => {
  console.log(`[server] multiplayergpt listening on http://localhost:${PORT}`);
  console.log(
    hasBuild
      ? "[server] serving the built client from dist/ - this port is all you need to share"
      : "[server] no dist/ build found; expecting the Vite dev server to serve the client",
  );
  console.log(
    ACCESS_CODE
      ? "[server] ACCESS_CODE is set - visitors must enter it to join"
      : "[server] ACCESS_CODE is not set - anyone with the URL can join and spend your API credits",
  );
});
