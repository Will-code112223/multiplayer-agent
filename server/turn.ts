import type Anthropic from "@anthropic-ai/sdk";
import type {
  AgentEntry,
  Entry,
  Participant,
  RunState,
  SessionConfig,
  ToolEntry,
  UserEntry,
} from "../shared/protocol.ts";
import type { AgentDriver } from "./agent.ts";
import { systemPromptFor } from "./agent.ts";
import { TOOLS, WORKSPACE_MUTATING, toolsFor } from "./tools.ts";

/**
 * One agent turn: stream, execute tools, repeat until the model stops asking.
 *
 * Talks to the session only through `TurnContext`, so this file has no
 * knowledge of sockets, presence or persistence.
 */

/** Cap on tool round-trips inside one turn, so a loop can't run away. */
const MAX_TOOL_ITERATIONS = 12;

export type Decision = "approve" | "deny" | "interrupted";

export interface PendingMessage {
  entry: UserEntry;
  author: Participant;
  text: string;
}

export interface TurnContext {
  readonly sessionId: string;
  readonly driver: AgentDriver;
  /** Read live: the group can retune settings between turns. */
  config(): SessionConfig;
  /** The conversation handed to the model. Mutated in place as the turn runs. */
  messages: Anthropic.MessageParam[];

  newEntryId(): string;
  addEntry(entry: Entry): void;
  setEntry(entry: Entry): void;
  emitDelta(id: string, channel: "text" | "thinking", text: string): void;

  run(): RunState;
  patchRun(patch: Partial<RunState>): void;

  /** Remove and return everything queued while this turn was in flight. */
  drainQueue(): PendingMessage[];
  queueLength(): number;

  /** Who pressed stop, when the turn was interrupted. */
  interruptedBy(): Participant | undefined;
  awaitDecision(entryId: string, signal: AbortSignal): Promise<Decision>;
  /** A tool changed the workspace; refresh the shared file list. */
  workspaceChanged(): void;
}

export async function runAgentTurn(ctx: TurnContext, signal: AbortSignal): Promise<void> {
  for (let iteration = 0; iteration < MAX_TOOL_ITERATIONS; iteration++) {
    const config = ctx.config();

    const agentEntry: AgentEntry = {
      kind: "agent",
      id: ctx.newEntryId(),
      at: Date.now(),
      text: "",
      thinking: "",
      status: "streaming",
      model: config.model,
    };
    ctx.addEntry(agentEntry);

    let outcome;
    try {
      outcome = await ctx.driver.runTurn(
        {
          messages: ctx.messages,
          model: config.model,
          system: systemPromptFor(config),
          tools: toolsFor(config),
        },
        {
          onText: (delta) => {
            agentEntry.text += delta;
            ctx.emitDelta(agentEntry.id, "text", delta);
          },
          onThinking: (delta) => {
            agentEntry.thinking += delta;
            ctx.emitDelta(agentEntry.id, "thinking", delta);
          },
        },
        signal,
      );
    } catch (error) {
      agentEntry.status = "error";
      agentEntry.error = error instanceof Error ? error.message : String(error);
      ctx.setEntry(agentEntry);
      return;
    }

    if (outcome.type === "interrupted") {
      agentEntry.status = "interrupted";
      agentEntry.interruptedBy = ctx.interruptedBy();
      ctx.setEntry(agentEntry);
      // Keep the partial answer so history stays coherent. Thinking blocks are
      // dropped: an aborted stream never produced signed ones.
      if (outcome.partialText.trim()) {
        ctx.messages.push({ role: "assistant", content: outcome.partialText });
      }
      return;
    }

    agentEntry.status = "done";
    ctx.setEntry(agentEntry);
    ctx.messages.push({ role: "assistant", content: outcome.content });

    if (outcome.toolUses.length === 0) return;

    const results = await executeTools(ctx, outcome.toolUses, signal);

    // Tool results must be the next user turn, so this is the earliest legal
    // point to deliver anything queued mid-turn. On interrupt the queue stays
    // put and the caller's loop starts a fresh turn for it.
    const content: Anthropic.ContentBlockParam[] = [...results];
    if (!signal.aborted) {
      for (const item of ctx.drainQueue()) {
        item.entry.queued = false;
        ctx.setEntry(item.entry);
        content.push({ type: "text", text: `[${item.author.name}] ${item.text}` });
      }
    }
    ctx.messages.push({ role: "user", content });
    ctx.patchRun({ queued: ctx.queueLength() });

    if (signal.aborted) return;
  }

  ctx.addEntry({
    kind: "system",
    id: ctx.newEntryId(),
    at: Date.now(),
    text: `Stopped after ${MAX_TOOL_ITERATIONS} tool rounds.`,
  });
}

/**
 * Run every requested tool, producing exactly one result per tool_use.
 *
 * Required even on interrupt: an unanswered tool_use makes the next request
 * invalid.
 */
async function executeTools(
  ctx: TurnContext,
  toolUses: { id: string; name: string; input: Record<string, unknown> }[],
  signal: AbortSignal,
): Promise<Anthropic.ToolResultBlockParam[]> {
  const results: Anthropic.ToolResultBlockParam[] = [];
  let touchedWorkspace = false;

  for (const use of toolUses) {
    const entry: ToolEntry = {
      kind: "tool",
      id: ctx.newEntryId(),
      at: Date.now(),
      name: use.name,
      input: use.input,
      status: "running",
    };

    const spec = TOOLS[use.name];
    if (!spec) {
      entry.status = "error";
      entry.output = `Unknown tool: ${use.name}`;
      ctx.addEntry(entry);
      results.push({ type: "tool_result", tool_use_id: use.id, content: entry.output, is_error: true });
      continue;
    }

    if (signal.aborted) {
      entry.status = "denied";
      entry.output = "Interrupted before this tool ran.";
      ctx.addEntry(entry);
      results.push({ type: "tool_result", tool_use_id: use.id, content: entry.output, is_error: true });
      continue;
    }

    if (spec.requiresApproval) {
      entry.status = "pending-approval";
      ctx.addEntry(entry);
      ctx.patchRun({ status: "awaiting-approval" });

      const decision = await ctx.awaitDecision(entry.id, signal);
      ctx.patchRun({ status: "running" });

      if (decision !== "approve") {
        entry.status = "denied";
        entry.output =
          decision === "interrupted"
            ? "Interrupted before anyone approved."
            : `Denied by ${entry.decidedBy?.name ?? "a participant"}.`;
        ctx.setEntry(entry);
        results.push({ type: "tool_result", tool_use_id: use.id, content: entry.output, is_error: true });
        continue;
      }
      entry.status = "running";
      ctx.setEntry(entry);
    } else {
      ctx.addEntry(entry);
    }

    try {
      const output = await spec.run(use.input, ctx.sessionId);
      entry.status = "ok";
      entry.output = output.length > 4000 ? `${output.slice(0, 4000)}\n... (truncated)` : output;
      if (WORKSPACE_MUTATING.has(use.name)) touchedWorkspace = true;
      results.push({ type: "tool_result", tool_use_id: use.id, content: output.slice(0, 100_000) });
    } catch (error) {
      entry.status = "error";
      entry.output = error instanceof Error ? error.message : String(error);
      results.push({ type: "tool_result", tool_use_id: use.id, content: entry.output, is_error: true });
    }
    ctx.setEntry(entry);
  }

  if (touchedWorkspace) ctx.workspaceChanged();
  return results;
}
