import { randomUUID } from "node:crypto";
import type { WebSocket } from "ws";
import type Anthropic from "@anthropic-ai/sdk";

import type {
  Entry,
  Participant,
  Role,
  RunState,
  ServerEvent,
  SessionConfig,
  SessionSnapshot,
  SessionSummary,
  UserEntry,
  WorkspaceFile,
} from "../shared/protocol.ts";
import type { AgentDriver } from "./agent.ts";
import { DEFAULT_CONFIG, MODELS } from "./agent.ts";
import * as store from "./store.ts";
import type { PersistedSession } from "./store.ts";
import { runAgentTurn } from "./turn.ts";
import type { Decision, PendingMessage, TurnContext } from "./turn.ts";
import { listWorkspace } from "./workspace.ts";

/** How many past events to retain for reconnecting clients. */
const EVENT_LOG_LIMIT = 1000;
/** How long a disconnected participant stays visible before being dropped. */
const PRESENCE_GRACE_MS = 20_000;

interface Connection {
  socket: WebSocket;
  participantId: string;
}

export interface JoinRequest {
  name: string;
  color: number;
  role: Role;
  participantId?: string;
  since?: number;
}

/**
 * One shared agent session.
 *
 * Server-authoritative: clients send intents (`say`, `steer`, `interrupt`,
 * `decide`) and receive the resulting events. They never mutate state directly.
 */
export class Session {
  readonly id: string;
  readonly createdAt: number;
  title = "Untitled session";

  private driver: AgentDriver;
  private entries: Entry[] = [];
  private entryIndex = new Map<string, Entry>();
  private participants = new Map<string, Participant>();
  private connections = new Set<Connection>();
  private dropTimers = new Map<string, NodeJS.Timeout>();

  /** The canonical conversation handed to the model. */
  private messages: Anthropic.MessageParam[] = [];
  /** Messages sent while a turn was in flight, waiting for a turn boundary. */
  private pending: PendingMessage[] = [];
  private pendingDecisions = new Map<string, (d: Decision) => void>();

  private config: SessionConfig = { ...DEFAULT_CONFIG };
  private files: WorkspaceFile[] = [];

  private runState: RunState = { status: "idle", queued: 0 };
  private driving = false;
  private abort: AbortController | null = null;
  private interrupter: Participant | undefined;

  private log: ServerEvent[] = [];
  private seq = 0;
  private nextEntryNumber = 0;
  private nextColor = 0;

  // Longhand rather than parameter properties: Node's TypeScript support only
  // strips types, so `npm start` can run this with plain `node`.
  constructor(id: string, driver: AgentDriver, restored?: PersistedSession) {
    this.id = id;
    this.driver = driver;
    this.createdAt = restored?.createdAt ?? Date.now();

    if (restored) {
      this.title = restored.title;
      this.entries = restored.entries;
      this.messages = restored.messages;
      this.config = { ...DEFAULT_CONFIG, ...restored.config };
      for (const entry of this.entries) this.entryIndex.set(entry.id, entry);
      for (const person of restored.roster) this.participants.set(person.id, person);
      // Continue past restored ids so new entries cannot collide.
      this.nextEntryNumber =
        Math.max(0, ...this.entries.map((e) => Number(e.id.slice(1)) + 1 || 0)) || 0;
      this.nextColor = restored.roster.length;
    }
    void this.refreshFiles();
  }

  // -------------------------------------------------------------------------
  // Persistence
  // -------------------------------------------------------------------------

  private persist(): void {
    store.scheduleSave({
      id: this.id,
      title: this.title,
      createdAt: this.createdAt,
      entries: this.entries,
      messages: this.messages,
      config: this.config,
      // Presence is runtime state; the stored roster is always offline.
      roster: [...this.participants.values()].map((p) => ({ ...p, online: false })),
    });
  }

  // -------------------------------------------------------------------------
  // Presence and connections
  // -------------------------------------------------------------------------

  attach(socket: WebSocket, req: JoinRequest): Participant {
    const existing = req.participantId ? this.participants.get(req.participantId) : undefined;
    const participant: Participant = existing
      ? { ...existing, name: req.name, color: req.color, role: req.role, online: true }
      : {
          id: req.participantId ?? randomUUID(),
          name: req.name,
          color: Number.isInteger(req.color) ? ((req.color % 8) + 8) % 8 : this.nextColor++ % 8,
          role: req.role,
          joinedAt: Date.now(),
          online: true,
        };

    this.participants.set(participant.id, participant);
    clearTimeout(this.dropTimers.get(participant.id));
    this.dropTimers.delete(participant.id);

    const connection: Connection = { socket, participantId: participant.id };
    this.connections.add(connection);
    socket.once("close", () => this.detach(connection));

    // Replay only what this client missed. The cursor must be servable: not
    // older than the retained log, and not ahead of us. A cursor from before a
    // restart looks ahead, and replaying it would send nothing at all.
    const oldest = this.log[0]?.seq;
    const servable =
      req.since !== undefined && oldest !== undefined && req.since >= oldest - 1 && req.since <= this.seq;
    if (servable) {
      for (const event of this.log.filter((e) => e.seq > req.since!)) this.send(socket, event);
    } else {
      this.send(socket, { seq: this.seq, t: "snapshot", you: participant, session: this.snapshot() });
    }

    if (!existing) {
      this.addEntry({
        kind: "system",
        id: this.newEntryId(),
        at: Date.now(),
        text: `${participant.name} joined${participant.role === "observer" ? " as an observer" : ""}.`,
      });
    }
    this.broadcastPresence();
    return participant;
  }

  private detach(connection: Connection): void {
    this.connections.delete(connection);
    const stillConnected = [...this.connections].some(
      (c) => c.participantId === connection.participantId,
    );
    if (stillConnected) return;

    const participant = this.participants.get(connection.participantId);
    if (!participant) return;
    this.participants.set(connection.participantId, { ...participant, online: false });
    this.broadcastPresence();

    // Hold the slot briefly, so a page refresh does not read as leaving.
    const timer = setTimeout(() => {
      const current = this.participants.get(connection.participantId);
      if (!current || current.online) return;
      this.participants.delete(connection.participantId);
      this.dropTimers.delete(connection.participantId);
      this.addEntry({
        kind: "system",
        id: this.newEntryId(),
        at: Date.now(),
        text: `${current.name} left the session.`,
      });
      this.broadcastPresence();
    }, PRESENCE_GRACE_MS);
    this.dropTimers.set(connection.participantId, timer);
  }

  rename(participantId: string, name: string, color?: number): void {
    const participant = this.participants.get(participantId);
    if (!participant || !name.trim()) return;
    this.participants.set(participantId, {
      ...participant,
      name: name.trim().slice(0, 32),
      color: Number.isInteger(color) ? ((color! % 8) + 8) % 8 : participant.color,
    });
    this.broadcastPresence();
  }

  setRole(participantId: string, role: Role): void {
    const participant = this.participants.get(participantId);
    if (!participant || participant.role === role) return;
    this.participants.set(participantId, { ...participant, role });
    this.addEntry({
      kind: "system",
      id: this.newEntryId(),
      at: Date.now(),
      text: `${participant.name} is now ${role === "observer" ? "observing" : "participating"}.`,
    });
    this.broadcastPresence();
  }

  setTyping(participantId: string, typing: boolean): void {
    this.emit({ seq: 0, t: "typing", participantId, typing });
  }

  summary(): SessionSummary {
    return {
      id: this.id,
      title: this.title,
      createdAt: this.createdAt,
      participants: [...this.participants.values()],
      status: this.runState.status,
      entries: this.entries.length,
    };
  }

  private snapshot(): SessionSnapshot {
    return {
      id: this.id,
      title: this.title,
      createdAt: this.createdAt,
      entries: this.entries,
      participants: [...this.participants.values()],
      run: this.runState,
      config: this.config,
      files: this.files,
      mock: this.driver.mock,
      models: [...MODELS],
    };
  }

  // -------------------------------------------------------------------------
  // Intents
  // -------------------------------------------------------------------------

  /**
   * Observers are refused here, not just in the UI. Defence in depth for a
   * nicer interface, not a security boundary: anyone can change their own role.
   */
  private actor(participantId: string, socketAction: string): Participant | null {
    const participant = this.participants.get(participantId);
    if (!participant) return null;
    if (participant.role === "observer") {
      this.sendToParticipant(participantId, {
        seq: this.seq,
        t: "denied",
        reason: `Observers cannot ${socketAction}. Switch to participant to join in.`,
      });
      return null;
    }
    return participant;
  }

  say(participantId: string, text: string): void {
    const author = this.actor(participantId, "send messages");
    const body = text.trim();
    if (!author || !body) return;

    const busy = this.runState.status !== "idle";
    const entry: UserEntry = {
      kind: "user",
      id: this.newEntryId(),
      at: Date.now(),
      author,
      text: body,
      queued: busy,
    };
    this.addEntry(entry);
    this.pending.push({ entry, author, text: body });

    if (this.title === "Untitled session") {
      this.title = body.slice(0, 60);
      this.emit({ seq: 0, t: "title", title: this.title });
    }

    if (busy) this.patchRun({ queued: this.pending.length });
    else void this.drive();
  }

  /** Interrupt whatever is running and redirect in one action. */
  steer(participantId: string, text: string): void {
    if (!this.actor(participantId, "steer the agent")) return;
    if (this.runState.status !== "idle") this.interrupt(participantId, { silent: true });
    this.say(participantId, text);
  }

  interrupt(participantId: string, opts: { silent?: boolean } = {}): void {
    const by = this.actor(participantId, "interrupt the agent");
    if (!by || this.runState.status === "idle" || !this.abort) return;
    this.interrupter = by;
    this.abort.abort();
    if (!opts.silent) {
      this.addEntry({
        kind: "system",
        id: this.newEntryId(),
        at: Date.now(),
        text: `${by.name} interrupted the agent.`,
      });
    }
  }

  decide(participantId: string, entryId: string, approve: boolean): void {
    const by = this.actor(participantId, "approve tool calls");
    const resolve = this.pendingDecisions.get(entryId);
    const entry = this.entryIndex.get(entryId);
    if (!by || !resolve || !entry || entry.kind !== "tool") return;
    this.pendingDecisions.delete(entryId);
    entry.decidedBy = by;
    this.setEntry(entry);
    resolve(approve ? "approve" : "deny");
  }

  /**
   * Retune the agent for this session.
   *
   * Idle-only: a change mid-turn would land on a conversation the previous
   * model was halfway through, and it discards the prompt cache.
   */
  setConfig(participantId: string, patch: Partial<SessionConfig>): void {
    const by = this.actor(participantId, "change the agent settings");
    if (!by) return;

    if (this.runState.status !== "idle") {
      this.sendToParticipant(participantId, {
        seq: this.seq,
        t: "denied",
        reason: "Settings can only change while the agent is idle. Stop it first.",
      });
      return;
    }

    const next: SessionConfig = { ...this.config };
    const changes: string[] = [];

    if (patch.model !== undefined && patch.model !== this.config.model) {
      if (!(MODELS as readonly string[]).includes(patch.model)) {
        this.sendToParticipant(participantId, {
          seq: this.seq,
          t: "denied",
          reason: `Unknown model: ${patch.model}`,
        });
        return;
      }
      next.model = patch.model;
      changes.push(`model to ${patch.model} (this resets the prompt cache)`);
    }
    if (patch.webSearch !== undefined && patch.webSearch !== this.config.webSearch) {
      next.webSearch = patch.webSearch;
      changes.push(`web search ${patch.webSearch ? "on" : "off"}`);
    }
    if (
      patch.systemPromptExtra !== undefined &&
      patch.systemPromptExtra !== this.config.systemPromptExtra
    ) {
      next.systemPromptExtra = patch.systemPromptExtra.slice(0, 4000);
      changes.push("the session instructions");
    }
    if (changes.length === 0) return;

    this.config = next;
    this.emit({ seq: 0, t: "config", config: this.config });
    this.addEntry({
      kind: "system",
      id: this.newEntryId(),
      at: Date.now(),
      text: `${by.name} changed ${changes.join(", ")}.`,
    });
  }

  // -------------------------------------------------------------------------
  // Agent loop
  // -------------------------------------------------------------------------

  private turnContext(): TurnContext {
    return {
      sessionId: this.id,
      driver: this.driver,
      config: () => this.config,
      messages: this.messages,
      newEntryId: () => this.newEntryId(),
      addEntry: (entry) => this.addEntry(entry),
      setEntry: (entry) => this.setEntry(entry),
      emitDelta: (id, channel, text) => this.emit({ seq: 0, t: "agent.delta", id, channel, text }),
      run: () => this.runState,
      patchRun: (patch) => this.patchRun(patch),
      drainQueue: () => this.pending.splice(0),
      queueLength: () => this.pending.length,
      interruptedBy: () => this.interrupter,
      awaitDecision: (entryId, signal) => this.awaitDecision(entryId, signal),
      workspaceChanged: () => void this.refreshFiles(),
    };
  }

  private async drive(): Promise<void> {
    if (this.driving) return;
    this.driving = true;
    try {
      while (this.pending.length > 0) {
        const batch = this.pending.splice(0);
        for (const item of batch) this.commitUserMessage(item);
        this.setRun({
          status: "running",
          startedBy: batch[0]?.author,
          startedAt: Date.now(),
          queued: 0,
        });

        const abort = new AbortController();
        this.abort = abort;
        this.interrupter = undefined;
        await runAgentTurn(this.turnContext(), abort.signal);
      }
    } catch (error) {
      this.addEntry({
        kind: "system",
        id: this.newEntryId(),
        at: Date.now(),
        text: `Agent error: ${error instanceof Error ? error.message : String(error)}`,
      });
    } finally {
      this.driving = false;
      this.abort = null;
      this.setRun({ status: "idle", queued: this.pending.length });
      // A message that arrived during teardown still needs a turn.
      if (this.pending.length > 0) void this.drive();
    }
  }

  /** Attribute the message to its sender so the agent can address people by name. */
  private commitUserMessage(item: PendingMessage): void {
    item.entry.queued = false;
    this.setEntry(item.entry);
    this.messages.push({ role: "user", content: `[${item.author.name}] ${item.text}` });
  }

  private awaitDecision(entryId: string, signal: AbortSignal): Promise<Decision> {
    return new Promise<Decision>((resolve) => {
      if (signal.aborted) return resolve("interrupted");
      const settle = (decision: Decision) => {
        signal.removeEventListener("abort", onAbort);
        this.pendingDecisions.delete(entryId);
        resolve(decision);
      };
      const onAbort = () => settle("interrupted");
      signal.addEventListener("abort", onAbort, { once: true });
      this.pendingDecisions.set(entryId, settle);
    });
  }

  private async refreshFiles(): Promise<void> {
    const files = await listWorkspace(this.id);
    const changed = JSON.stringify(files) !== JSON.stringify(this.files);
    this.files = files;
    if (changed) this.emit({ seq: 0, t: "files", files });
  }

  // -------------------------------------------------------------------------
  // Event plumbing
  // -------------------------------------------------------------------------

  private newEntryId(): string {
    return `e${this.nextEntryNumber++}`;
  }

  private addEntry(entry: Entry): void {
    this.entries.push(entry);
    this.entryIndex.set(entry.id, entry);
    this.emit({ seq: 0, t: "entry.add", entry });
    this.persist();
  }

  private setEntry(entry: Entry): void {
    this.entryIndex.set(entry.id, entry);
    this.emit({ seq: 0, t: "entry.set", entry });
    this.persist();
  }

  private setRun(run: RunState): void {
    this.runState = run;
    this.emit({ seq: 0, t: "run", run });
  }

  private patchRun(patch: Partial<RunState>): void {
    this.setRun({ ...this.runState, ...patch });
  }

  private broadcastPresence(): void {
    this.emit({ seq: 0, t: "presence", participants: [...this.participants.values()] });
    this.persist();
  }

  private emit(event: ServerEvent): void {
    const stamped = { ...event, seq: ++this.seq } as ServerEvent;
    this.log.push(stamped);
    if (this.log.length > EVENT_LOG_LIMIT) this.log.splice(0, this.log.length - EVENT_LOG_LIMIT);
    const payload = JSON.stringify(stamped);
    for (const connection of this.connections) {
      if (connection.socket.readyState === connection.socket.OPEN) connection.socket.send(payload);
    }
  }

  /** Sent to one person; never enters the shared log or moves cursors. */
  private sendToParticipant(participantId: string, event: ServerEvent): void {
    for (const connection of this.connections) {
      if (connection.participantId === participantId) this.send(connection.socket, event);
    }
  }

  private send(socket: WebSocket, event: ServerEvent): void {
    if (socket.readyState === socket.OPEN) socket.send(JSON.stringify(event));
  }
}
