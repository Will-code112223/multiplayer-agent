import { randomUUID } from "node:crypto";
import type { WebSocket } from "ws";
import type Anthropic from "@anthropic-ai/sdk";

import type {
  AgentEntry,
  Entry,
  Participant,
  RunState,
  ServerEvent,
  SessionSnapshot,
  SessionSummary,
  ToolEntry,
  UserEntry,
} from "../shared/protocol.ts";
import type { AgentDriver } from "./agent.ts";
import { TOOLS } from "./tools.ts";

/** Cap on tool round-trips inside one turn, so a loop can't run away. */
const MAX_TOOL_ITERATIONS = 12;
/** How many past events to retain for reconnecting clients. */
const EVENT_LOG_LIMIT = 1000;
/** How long a disconnected participant stays visible before being dropped. */
const PRESENCE_GRACE_MS = 20_000;

interface Connection {
  socket: WebSocket;
  participantId: string;
}

interface PendingMessage {
  entry: UserEntry;
  author: Participant;
  text: string;
}

type Decision = "approve" | "deny" | "interrupted";

/**
 * One shared agent session.
 *
 * Everything here is server-authoritative. Clients never mutate state directly;
 * they send intents (`say`, `steer`, `interrupt`, `decide`) and receive the
 * resulting events. That is what lets two people act on the same running agent
 * without either of them holding a lock.
 */
export class Session {
  readonly id: string;
  readonly createdAt = Date.now();
  title = "Untitled session";

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

  private run: RunState = { status: "idle", queued: 0 };
  private driving = false;
  private abort: AbortController | null = null;
  private interruptedBy: Participant | undefined;

  private log: ServerEvent[] = [];
  private seq = 0;
  private nextEntryNumber = 0;
  private nextColor = 0;

  private driver: AgentDriver;

  // Written out longhand rather than as constructor parameter properties: those
  // need code generation, and Node's built-in TypeScript support only strips
  // types. Keeping to strippable syntax is what lets `npm start` run the server
  // with plain `node`, no build step and no dev dependencies.
  constructor(id: string, driver: AgentDriver) {
    this.id = id;
    this.driver = driver;
  }

  // -------------------------------------------------------------------------
  // Presence and connections
  // -------------------------------------------------------------------------

  attach(socket: WebSocket, name: string, participantId?: string, since?: number): Participant {
    const existing = participantId ? this.participants.get(participantId) : undefined;
    const participant: Participant = existing
      ? { ...existing, name, online: true }
      : {
          id: participantId ?? randomUUID(),
          name,
          color: this.nextColor++ % 8,
          joinedAt: Date.now(),
          online: true,
        };

    this.participants.set(participant.id, participant);
    clearTimeout(this.dropTimers.get(participant.id));
    this.dropTimers.delete(participant.id);

    const connection: Connection = { socket, participantId: participant.id };
    this.connections.add(connection);
    socket.once("close", () => this.detach(connection));

    // Reconnect fast-path: replay only the events this client missed.
    //
    // The cursor has to be one this incarnation of the session can actually
    // serve: not older than the retained log, and not ahead of us. A cursor from
    // before a server restart looks ahead of ours, and replaying against it would
    // send nothing at all and strand the client on an empty transcript.
    const oldest = this.log[0]?.seq;
    const servable =
      since !== undefined && oldest !== undefined && since >= oldest - 1 && since <= this.seq;
    if (servable) {
      const missed = this.log.filter((e) => e.seq > since);
      for (const event of missed) this.send(socket, event);
    } else {
      this.send(socket, {
        seq: this.seq,
        t: "snapshot",
        you: participant,
        session: this.snapshot(),
      });
    }

    if (!existing) {
      this.addEntry({
        kind: "system",
        id: this.newEntryId(),
        at: Date.now(),
        text: `${participant.name} joined the session.`,
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

    // Hold the slot briefly so a page refresh does not read as leaving.
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

  rename(participantId: string, name: string): void {
    const participant = this.participants.get(participantId);
    if (!participant || !name.trim()) return;
    this.participants.set(participantId, { ...participant, name: name.trim().slice(0, 32) });
    this.broadcastPresence();
  }

  setTyping(participantId: string, typing: boolean): void {
    this.emit({ seq: 0, t: "typing", participantId, typing });
  }

  get participantCount(): number {
    return this.participants.size;
  }

  summary(): SessionSummary {
    return {
      id: this.id,
      title: this.title,
      createdAt: this.createdAt,
      participants: [...this.participants.values()],
      status: this.run.status,
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
      run: this.run,
      mock: this.driver.mock,
      model: this.driver.model,
    };
  }

  // -------------------------------------------------------------------------
  // Intents
  // -------------------------------------------------------------------------

  say(participantId: string, text: string): void {
    const author = this.participants.get(participantId);
    const body = text.trim();
    if (!author || !body) return;

    const busy = this.run.status !== "idle";
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

    if (busy) this.setRun({ ...this.run, queued: this.pending.length });
    else void this.drive();
  }

  /** Interrupt whatever is running and redirect in one action. */
  steer(participantId: string, text: string): void {
    const author = this.participants.get(participantId);
    if (!author) return;
    if (this.run.status !== "idle") this.interrupt(participantId, { silent: true });
    this.say(participantId, text);
  }

  interrupt(participantId: string, opts: { silent?: boolean } = {}): void {
    const by = this.participants.get(participantId);
    if (!by || this.run.status === "idle" || !this.abort) return;
    this.interruptedBy = by;
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
    const by = this.participants.get(participantId);
    const resolve = this.pendingDecisions.get(entryId);
    const entry = this.entryIndex.get(entryId);
    if (!by || !resolve || !entry || entry.kind !== "tool") return;
    this.pendingDecisions.delete(entryId);
    entry.decidedBy = by;
    this.setEntry(entry);
    resolve(approve ? "approve" : "deny");
  }

  // -------------------------------------------------------------------------
  // Agent loop
  // -------------------------------------------------------------------------

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
        await this.runTurn();
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
      // A message that arrived during teardown still deserves a turn.
      if (this.pending.length > 0) void this.drive();
    }
  }

  /** Attribute the message to its sender so the agent can address people by name. */
  private commitUserMessage(item: PendingMessage): void {
    item.entry.queued = false;
    this.setEntry(item.entry);
    this.messages.push({ role: "user", content: `[${item.author.name}] ${item.text}` });
  }

  private async runTurn(): Promise<void> {
    const abort = new AbortController();
    this.abort = abort;
    this.interruptedBy = undefined;

    for (let iteration = 0; iteration < MAX_TOOL_ITERATIONS; iteration++) {
      const agentEntry: AgentEntry = {
        kind: "agent",
        id: this.newEntryId(),
        at: Date.now(),
        text: "",
        thinking: "",
        status: "streaming",
      };
      this.addEntry(agentEntry);

      let outcome;
      try {
        outcome = await this.driver.runTurn(
          this.messages,
          {
            onText: (delta) => {
              agentEntry.text += delta;
              this.emit({ seq: 0, t: "agent.delta", id: agentEntry.id, channel: "text", text: delta });
            },
            onThinking: (delta) => {
              agentEntry.thinking += delta;
              this.emit({ seq: 0, t: "agent.delta", id: agentEntry.id, channel: "thinking", text: delta });
            },
          },
          abort.signal,
        );
      } catch (error) {
        agentEntry.status = "error";
        agentEntry.error = error instanceof Error ? error.message : String(error);
        this.setEntry(agentEntry);
        return;
      }

      if (outcome.type === "interrupted") {
        agentEntry.status = "interrupted";
        agentEntry.interruptedBy = this.interruptedBy;
        this.setEntry(agentEntry);
        // Keep the partial answer in history so the conversation stays coherent.
        // Thinking blocks are dropped: an aborted stream never produced signed ones.
        if (outcome.partialText.trim()) {
          this.messages.push({ role: "assistant", content: outcome.partialText });
        }
        return;
      }

      agentEntry.status = "done";
      this.setEntry(agentEntry);
      this.messages.push({ role: "assistant", content: outcome.content });

      if (outcome.toolUses.length === 0) return;

      const results = await this.executeTools(outcome.toolUses, abort.signal);

      // Tool results must be the very next user turn - a separate user message
      // between tool_use and tool_result is rejected - so this is the earliest
      // legal point to deliver anything queued during the turn.
      //
      // Unless we were interrupted: then the queue stays put, so the caller's
      // loop starts a fresh turn for it instead of burying it in a turn that is
      // already being torn down.
      const content: Anthropic.ContentBlockParam[] = [...results];
      if (!abort.signal.aborted) {
        for (const item of this.pending.splice(0)) {
          item.entry.queued = false;
          this.setEntry(item.entry);
          content.push({ type: "text", text: `[${item.author.name}] ${item.text}` });
        }
      }
      this.messages.push({ role: "user", content });
      this.setRun({ ...this.run, queued: this.pending.length });

      if (abort.signal.aborted) return;
    }

    this.addEntry({
      kind: "system",
      id: this.newEntryId(),
      at: Date.now(),
      text: `Stopped after ${MAX_TOOL_ITERATIONS} tool rounds.`,
    });
  }

  /**
   * Run every requested tool, producing exactly one result per tool_use.
   *
   * The one-to-one guarantee matters even when the run is interrupted midway:
   * an assistant turn with an unanswered tool_use makes the next request invalid.
   */
  private async executeTools(
    toolUses: { id: string; name: string; input: Record<string, unknown> }[],
    signal: AbortSignal,
  ): Promise<Anthropic.ToolResultBlockParam[]> {
    const results: Anthropic.ToolResultBlockParam[] = [];

    for (const use of toolUses) {
      const entry: ToolEntry = {
        kind: "tool",
        id: this.newEntryId(),
        at: Date.now(),
        name: use.name,
        input: use.input,
        status: "running",
      };

      const spec = TOOLS[use.name];
      if (!spec) {
        entry.status = "error";
        entry.output = `Unknown tool: ${use.name}`;
        this.addEntry(entry);
        results.push({ type: "tool_result", tool_use_id: use.id, content: entry.output, is_error: true });
        continue;
      }

      if (signal.aborted) {
        entry.status = "denied";
        entry.output = "Interrupted before this tool ran.";
        this.addEntry(entry);
        results.push({ type: "tool_result", tool_use_id: use.id, content: entry.output, is_error: true });
        continue;
      }

      if (spec.requiresApproval) {
        entry.status = "pending-approval";
        this.addEntry(entry);
        this.setRun({ ...this.run, status: "awaiting-approval" });

        const decision = await this.awaitDecision(entry.id, signal);
        this.setRun({ ...this.run, status: "running" });

        if (decision !== "approve") {
          entry.status = "denied";
          entry.output =
            decision === "interrupted"
              ? "Interrupted before anyone approved."
              : `Denied by ${entry.decidedBy?.name ?? "a participant"}.`;
          this.setEntry(entry);
          results.push({ type: "tool_result", tool_use_id: use.id, content: entry.output, is_error: true });
          continue;
        }
        entry.status = "running";
        this.setEntry(entry);
      } else {
        this.addEntry(entry);
      }

      try {
        const output = await spec.run(use.input, this.id);
        entry.status = "ok";
        entry.output = output.length > 4000 ? `${output.slice(0, 4000)}\n... (truncated)` : output;
        results.push({ type: "tool_result", tool_use_id: use.id, content: output.slice(0, 100_000) });
      } catch (error) {
        entry.status = "error";
        entry.output = error instanceof Error ? error.message : String(error);
        results.push({ type: "tool_result", tool_use_id: use.id, content: entry.output, is_error: true });
      }
      this.setEntry(entry);
    }

    return results;
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
  }

  private setEntry(entry: Entry): void {
    this.entryIndex.set(entry.id, entry);
    this.emit({ seq: 0, t: "entry.set", entry });
  }

  private setRun(run: RunState): void {
    this.run = run;
    this.emit({ seq: 0, t: "run", run });
  }

  private broadcastPresence(): void {
    this.emit({ seq: 0, t: "presence", participants: [...this.participants.values()] });
  }

  private emit(event: ServerEvent): void {
    const stamped = { ...event, seq: ++this.seq } as ServerEvent;
    this.log.push(stamped);
    if (this.log.length > EVENT_LOG_LIMIT) this.log.splice(0, this.log.length - EVENT_LOG_LIMIT);
    const payload = JSON.stringify(stamped);
    for (const connection of this.connections) {
      if (connection.socket.readyState === connection.socket.OPEN) {
        connection.socket.send(payload);
      }
    }
  }

  private send(socket: WebSocket, event: ServerEvent): void {
    if (socket.readyState === socket.OPEN) socket.send(JSON.stringify(event));
  }
}
