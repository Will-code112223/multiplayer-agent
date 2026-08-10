import { useCallback, useEffect, useRef, useState } from "react";
import type {
  ClientEvent,
  Entry,
  Participant,
  RunState,
  ServerEvent,
} from "../shared/protocol.ts";

export type ConnectionState = "connecting" | "open" | "closed";

export interface SessionView {
  connection: ConnectionState;
  me: Participant | null;
  title: string;
  entries: Entry[];
  participants: Participant[];
  run: RunState;
  mock: boolean;
  model: string;
  typing: Set<string>;
}

const IDENTITY_KEY = "mpgpt.identity";

interface Identity {
  participantId: string;
  name: string;
}

const NAMES = [
  "Ada", "Boris", "Cleo", "Dara", "Enzo", "Fern", "Gus", "Hana",
  "Iris", "Jonas", "Kit", "Lena", "Milo", "Nova", "Otis", "Pia",
];

/**
 * `?as=Name` opts a tab into a per-tab identity.
 *
 * Without it, every tab in a browser shares one localStorage identity and so
 * shows up as the same person - which makes it impossible to try a multiplayer
 * session on your own, or to demo one from a single machine.
 */
function forcedName(): string | null {
  return new URLSearchParams(location.search).get("as");
}

function identityStore(): Storage {
  return forcedName() !== null ? sessionStorage : localStorage;
}

export function loadIdentity(): Identity {
  const forced = forcedName();
  try {
    const raw = identityStore().getItem(IDENTITY_KEY);
    if (raw) return JSON.parse(raw) as Identity;
  } catch {
    // fall through to a fresh identity
  }
  const identity: Identity = {
    participantId: crypto.randomUUID(),
    name: forced?.trim() || NAMES[Math.floor(Math.random() * NAMES.length)] || "Guest",
  };
  saveIdentity(identity);
  return identity;
}

export function saveIdentity(identity: Identity): void {
  try {
    identityStore().setItem(IDENTITY_KEY, JSON.stringify(identity));
  } catch {
    // storage unavailable; identity lives only in memory for this page load
  }
}

const EMPTY_RUN: RunState = { status: "idle", queued: 0 };

/**
 * Subscribe to a session.
 *
 * The client is a projection of server state: it applies a snapshot, then
 * deltas. On reconnect it replays from the last seq it saw, so a dropped socket
 * costs nothing - which matters when a session may run for hours and people
 * close laptops in the middle of it.
 */
export function useSession(sessionId: string | null): SessionView & {
  send: (event: ClientEvent) => void;
} {
  const [connection, setConnection] = useState<ConnectionState>("connecting");
  const [me, setMe] = useState<Participant | null>(null);
  const [title, setTitle] = useState("Untitled session");
  const [entries, setEntries] = useState<Entry[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [run, setRun] = useState<RunState>(EMPTY_RUN);
  const [mock, setMock] = useState(false);
  const [model, setModel] = useState("");
  const [typing, setTyping] = useState<Set<string>>(new Set());

  const socketRef = useRef<WebSocket | null>(null);
  const seqRef = useRef<number>(-1);
  const typingTimers = useRef(new Map<string, number>());

  const send = useCallback((event: ClientEvent) => {
    const socket = socketRef.current;
    if (socket?.readyState === WebSocket.OPEN) socket.send(JSON.stringify(event));
  }, []);

  useEffect(() => {
    if (!sessionId) return;

    let disposed = false;
    let retry = 0;
    let reconnectTimer: number | undefined;

    const connect = () => {
      if (disposed) return;
      setConnection(seqRef.current >= 0 ? "connecting" : "connecting");

      const url = new URL("/ws", location.href);
      url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
      const socket = new WebSocket(url);
      socketRef.current = socket;

      socket.onopen = () => {
        retry = 0;
        setConnection("open");
        const identity = loadIdentity();
        const hello: ClientEvent = {
          t: "hello",
          sessionId,
          name: identity.name,
          participantId: identity.participantId,
          ...(seqRef.current >= 0 ? { since: seqRef.current } : {}),
        };
        socket.send(JSON.stringify(hello));
      };

      socket.onmessage = (raw) => {
        const event = JSON.parse(raw.data as string) as ServerEvent;
        seqRef.current = event.seq;
        apply(event);
      };

      socket.onclose = () => {
        if (disposed) return;
        setConnection("closed");
        retry += 1;
        reconnectTimer = window.setTimeout(connect, Math.min(500 * 2 ** (retry - 1), 4000));
      };
    };

    const apply = (event: ServerEvent) => {
      switch (event.t) {
        case "snapshot":
          setMe(event.you);
          setTitle(event.session.title);
          setEntries(event.session.entries);
          setParticipants(event.session.participants);
          setRun(event.session.run);
          setMock(event.session.mock);
          setModel(event.session.model);
          break;
        case "presence":
          setParticipants(event.participants);
          break;
        case "title":
          setTitle(event.title);
          break;
        case "run":
          setRun(event.run);
          break;
        case "entry.add":
          setEntries((prev) => [...prev, event.entry]);
          break;
        case "entry.set":
          setEntries((prev) => prev.map((e) => (e.id === event.entry.id ? event.entry : e)));
          break;
        case "agent.delta":
          setEntries((prev) =>
            prev.map((e) => {
              if (e.id !== event.id || e.kind !== "agent") return e;
              return event.channel === "text"
                ? { ...e, text: e.text + event.text }
                : { ...e, thinking: e.thinking + event.text };
            }),
          );
          break;
        case "typing": {
          const { participantId, typing: isTyping } = event;
          setTyping((prev) => {
            const next = new Set(prev);
            if (isTyping) next.add(participantId);
            else next.delete(participantId);
            return next;
          });
          window.clearTimeout(typingTimers.current.get(participantId));
          if (isTyping) {
            typingTimers.current.set(
              participantId,
              window.setTimeout(() => {
                setTyping((prev) => {
                  const next = new Set(prev);
                  next.delete(participantId);
                  return next;
                });
              }, 4000),
            );
          }
          break;
        }
      }
    };

    connect();
    return () => {
      disposed = true;
      window.clearTimeout(reconnectTimer);
      socketRef.current?.close();
      socketRef.current = null;
    };
  }, [sessionId]);

  return { connection, me, title, entries, participants, run, mock, model, typing, send };
}
