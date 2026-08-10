/**
 * Wire protocol shared by the server and the web client.
 *
 * The server owns all session state. Clients are pure projections: they receive
 * a snapshot on join and a stream of deltas afterwards. Every delta carries a
 * monotonic `seq`, so a client that drops its socket can reconnect with the last
 * seq it saw and receive exactly the events it missed. That property is what
 * makes late-join and reconnect lossless, which is the whole point of a session
 * several people share.
 */

/**
 * Observers watch a session without being able to act in it.
 *
 * This is a UX affordance, not a security boundary: any participant can change
 * their own role. The access code is the only real gate, and it is
 * all-or-nothing. Do not treat `observer` as a permission.
 */
export type Role = "participant" | "observer";

export interface Participant {
  id: string;
  name: string;
  /** Index into the client palette. Stable for the life of the session. */
  color: number;
  role: Role;
  joinedAt: number;
  /** False while the participant is disconnected but still within the grace window. */
  online: boolean;
}

export type RunStatus = "idle" | "running" | "awaiting-approval";

export interface RunState {
  status: RunStatus;
  /** Who kicked off the turn currently in flight. */
  startedBy?: Participant;
  startedAt?: number;
  /** Messages sent while the agent was busy, waiting for the next turn boundary. */
  queued: number;
}

/** Per-session agent settings the group can retune between turns. */
export interface SessionConfig {
  model: string;
  /** Appended to the base system prompt. Empty string means no addition. */
  systemPromptExtra: string;
  webSearch: boolean;
}

/** A file the agent wrote into the session's shared workspace. */
export interface WorkspaceFile {
  path: string;
  size: number;
  modifiedAt: number;
}

// ---------------------------------------------------------------------------
// Transcript entries
// ---------------------------------------------------------------------------

export interface UserEntry {
  kind: "user";
  id: string;
  at: number;
  author: Participant;
  text: string;
  /** True while the message is waiting for the agent to reach a turn boundary. */
  queued: boolean;
}

export interface AgentEntry {
  kind: "agent";
  id: string;
  at: number;
  text: string;
  thinking: string;
  status: "streaming" | "done" | "interrupted" | "error";
  interruptedBy?: Participant;
  error?: string;
  /** Which model produced this turn, so a switch mid-session stays legible. */
  model?: string;
}

export type ToolStatus =
  | "pending-approval"
  | "running"
  | "ok"
  | "error"
  | "denied";

export interface ToolEntry {
  kind: "tool";
  id: string;
  at: number;
  name: string;
  input: unknown;
  status: ToolStatus;
  /** Rendered result or error, truncated for display. */
  output?: string;
  /** Who approved or denied, when the tool required a decision. */
  decidedBy?: Participant;
}

export interface SystemEntry {
  kind: "system";
  id: string;
  at: number;
  text: string;
}

export type Entry = UserEntry | AgentEntry | ToolEntry | SystemEntry;

// ---------------------------------------------------------------------------
// Server -> client
// ---------------------------------------------------------------------------

export interface SessionSnapshot {
  id: string;
  title: string;
  createdAt: number;
  entries: Entry[];
  participants: Participant[];
  run: RunState;
  config: SessionConfig;
  files: WorkspaceFile[];
  /** True when the server has no Anthropic credentials and is faking the agent. */
  mock: boolean;
  /** Models `setConfig` will accept. */
  models: string[];
}

export type ServerEvent =
  /** Sent on join, and whenever a reconnecting client's cursor can't be served. */
  | { seq: number; t: "snapshot"; you: Participant; session: SessionSnapshot }
  | { seq: number; t: "presence"; participants: Participant[] }
  | { seq: number; t: "typing"; participantId: string; typing: boolean }
  | { seq: number; t: "entry.add"; entry: Entry }
  /** Full replacement of one entry. Cheap, and immune to patch-ordering bugs. */
  | { seq: number; t: "entry.set"; entry: Entry }
  /** Append-only text delta, the one place where bandwidth is worth optimizing. */
  | { seq: number; t: "agent.delta"; id: string; channel: "text" | "thinking"; text: string }
  | { seq: number; t: "run"; run: RunState }
  | { seq: number; t: "title"; title: string }
  | { seq: number; t: "config"; config: SessionConfig }
  | { seq: number; t: "files"; files: WorkspaceFile[] }
  /**
   * An intent was refused. Sent only to the socket that tried it, so it never
   * enters the shared event log.
   */
  | { seq: number; t: "denied"; reason: string };

// ---------------------------------------------------------------------------
// Client -> server
// ---------------------------------------------------------------------------

export type ClientEvent =
  | {
      t: "hello";
      sessionId: string;
      name: string;
      color: number;
      role: Role;
      participantId?: string;
      since?: number;
      /** Required only when the server has ACCESS_CODE set. */
      code?: string;
    }
  /** Send a message. Queued behind the agent if a turn is already in flight. */
  | { t: "say"; text: string }
  /** Interrupt whatever is running and immediately redirect with new instructions. */
  | { t: "steer"; text: string }
  | { t: "interrupt" }
  | { t: "typing"; typing: boolean }
  | { t: "decide"; entryId: string; approve: boolean }
  | { t: "rename"; name: string; color?: number }
  | { t: "setRole"; role: Role }
  /** Refused while the agent is running, because it would invalidate mid-turn. */
  | { t: "setConfig"; config: Partial<SessionConfig> };

// ---------------------------------------------------------------------------
// REST
// ---------------------------------------------------------------------------

export interface SessionSummary {
  id: string;
  title: string;
  createdAt: number;
  participants: Participant[];
  status: RunStatus;
  entries: number;
}

/** Unauthenticated. Reveals that a code is required, never the code itself. */
export interface ServerConfig {
  authRequired: boolean;
  mock: boolean;
  models: string[];
  defaultModel: string;
}
