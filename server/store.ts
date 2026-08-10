import fs from "node:fs";
import path from "node:path";
import type Anthropic from "@anthropic-ai/sdk";
import type { Entry, Participant, SessionConfig } from "../shared/protocol.ts";

/**
 * Session persistence: one JSON file per session under `data/sessions/`.
 *
 * Deliberately not a database. A prototype that must survive `Ctrl+C` needs
 * durability, not queries, and files keep the dependency count at zero.
 *
 * What is stored is the conversation, not the connection: sockets, the event
 * log, the pending queue and run state are all runtime-only and are rebuilt on
 * boot. The event log resetting means a reconnecting client's cursor is ahead
 * of the server's, which already falls back to a snapshot.
 */

const DIR = path.resolve(process.cwd(), "data", "sessions");
const SAVE_DEBOUNCE_MS = 500;

export interface PersistedSession {
  id: string;
  title: string;
  createdAt: number;
  entries: Entry[];
  /** The conversation as handed to the model. */
  messages: Anthropic.MessageParam[];
  config: SessionConfig;
  /** Roster, so returning people keep their name, colour and role. */
  roster: Participant[];
}

const timers = new Map<string, NodeJS.Timeout>();
const dirty = new Map<string, PersistedSession>();

function ensureDir(): void {
  fs.mkdirSync(DIR, { recursive: true });
}

function fileFor(id: string): string {
  // Session ids are server-generated, but this is a filesystem path, so refuse
  // anything that isn't the shape we issue rather than trusting the caller.
  if (!/^[A-Za-z0-9_-]{1,64}$/.test(id)) throw new Error(`unsafe session id: ${id}`);
  return path.join(DIR, `${id}.json`);
}

/** Write immediately. Prefer `scheduleSave` on hot paths. */
function writeNow(session: PersistedSession): void {
  try {
    ensureDir();
    const target = fileFor(session.id);
    // Write-then-rename, so a crash mid-write can't leave a truncated file that
    // fails to parse on the next boot.
    const temp = `${target}.tmp`;
    fs.writeFileSync(temp, JSON.stringify(session), "utf8");
    fs.renameSync(temp, target);
  } catch (error) {
    console.warn(
      `[store] could not save ${session.id}: ${error instanceof Error ? error.message : error}`,
    );
  }
}

/**
 * Queue a save. Repeated calls within the debounce window collapse into one,
 * which matters because a streaming turn mutates an entry on every token.
 */
export function scheduleSave(session: PersistedSession): void {
  dirty.set(session.id, session);
  clearTimeout(timers.get(session.id));
  timers.set(
    session.id,
    setTimeout(() => {
      timers.delete(session.id);
      const pending = dirty.get(session.id);
      dirty.delete(session.id);
      if (pending) writeNow(pending);
    }, SAVE_DEBOUNCE_MS),
  );
}

/** Flush every pending save synchronously. Called on shutdown. */
export function flushAll(): void {
  for (const timer of timers.values()) clearTimeout(timer);
  timers.clear();
  for (const session of dirty.values()) writeNow(session);
  dirty.clear();
}

export function remove(id: string): void {
  try {
    clearTimeout(timers.get(id));
    timers.delete(id);
    dirty.delete(id);
    fs.rmSync(fileFor(id), { force: true });
  } catch {
    // nothing to remove
  }
}

/**
 * Load every persisted session, normalising anything that only made sense while
 * a process was running: nobody is connected, and a turn that was streaming when
 * the server stopped did not survive it.
 */
export function loadAll(): PersistedSession[] {
  let names: string[];
  try {
    ensureDir();
    names = fs.readdirSync(DIR).filter((n) => n.endsWith(".json"));
  } catch {
    return [];
  }

  const sessions: PersistedSession[] = [];
  for (const name of names) {
    try {
      const raw = fs.readFileSync(path.join(DIR, name), "utf8");
      const parsed = JSON.parse(raw) as PersistedSession;
      if (!parsed?.id || !Array.isArray(parsed.entries)) continue;

      parsed.roster = (parsed.roster ?? []).map((p) => ({ ...p, online: false }));
      parsed.entries = parsed.entries.map((entry) =>
        entry.kind === "agent" && entry.status === "streaming"
          ? { ...entry, status: "interrupted" as const }
          : entry,
      );
      parsed.messages = parsed.messages ?? [];
      sessions.push(parsed);
    } catch (error) {
      console.warn(
        `[store] skipping unreadable ${name}: ${error instanceof Error ? error.message : error}`,
      );
    }
  }
  return sessions;
}
