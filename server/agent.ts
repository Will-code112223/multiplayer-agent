import Anthropic from "@anthropic-ai/sdk";
import { TOOL_DEFINITIONS } from "./tools.ts";

/**
 * The agent driver: one turn of the model, streamed, interruptible.
 *
 * Two implementations satisfy the same interface - the real Anthropic client,
 * and a scripted mock used when no credentials are present. The mock exists so
 * the multiplayer mechanics (streaming to many viewers, interrupting, steering,
 * queueing, shared tool approval) can be exercised end to end with zero setup.
 */

export const MODEL = "claude-opus-5";

export const SYSTEM_PROMPT = `You are a shared agent in a multiplayer session. Several people watch this
conversation at the same time. Any of them can send you a message, interrupt you mid-task, redirect
you, or approve your tool calls. Each user message is prefixed with the sender's name.

Because the session is shared:
- Address people by name when it matters, and say which request you are acting on when more than one
  is in flight.
- When someone interrupts or redirects you, acknowledge the change in one short sentence and act on
  the new direction. Do not re-litigate the previous direction.
- Treat the workspace as the group's shared surface. Anything the group should be able to inspect -
  notes, drafts, results, plans - belongs in a file, not only in chat.

Keep responses focused and brief so they stay readable to people who are skimming. Lead with the
outcome, then supporting detail. Deliver what was asked at the scope intended: make routine judgment
calls yourself, and check in only when different readings would lead to materially different work.`;

export interface ToolUse {
  id: string;
  name: string;
  input: Record<string, unknown>;
}

export type TurnOutcome =
  | {
      type: "complete";
      content: Anthropic.MessageParam["content"];
      toolUses: ToolUse[];
      stopReason: string | null;
    }
  | { type: "interrupted"; partialText: string };

export interface TurnHandlers {
  onText(delta: string): void;
  onThinking(delta: string): void;
}

export interface AgentDriver {
  readonly mock: boolean;
  readonly model: string;
  runTurn(
    messages: Anthropic.MessageParam[],
    handlers: TurnHandlers,
    signal: AbortSignal,
  ): Promise<TurnOutcome>;
}

// ---------------------------------------------------------------------------
// Real driver
// ---------------------------------------------------------------------------

class AnthropicDriver implements AgentDriver {
  readonly mock = false;
  readonly model = MODEL;
  private client = new Anthropic();

  async runTurn(
    messages: Anthropic.MessageParam[],
    handlers: TurnHandlers,
    signal: AbortSignal,
  ): Promise<TurnOutcome> {
    let partialText = "";

    const stream = this.client.messages.stream(
      {
        model: MODEL,
        max_tokens: 32000,
        // Summarized thinking is the point in a shared session: spectators can
        // watch the agent reason instead of staring at a spinner.
        thinking: { type: "adaptive", display: "summarized" },
        output_config: { effort: "high" },
        system: SYSTEM_PROMPT,
        tools: TOOL_DEFINITIONS,
        messages,
      },
      { signal },
    );

    try {
      for await (const event of stream) {
        if (event.type !== "content_block_delta") continue;
        if (event.delta.type === "text_delta") {
          partialText += event.delta.text;
          handlers.onText(event.delta.text);
        } else if (event.delta.type === "thinking_delta") {
          handlers.onThinking(event.delta.thinking);
        }
      }

      const final = await stream.finalMessage();
      const toolUses: ToolUse[] = final.content
        .filter((b): b is Anthropic.ToolUseBlock => b.type === "tool_use")
        .map((b) => ({
          id: b.id,
          name: b.name,
          input: (b.input ?? {}) as Record<string, unknown>,
        }));

      return {
        type: "complete",
        content: final.content,
        toolUses,
        stopReason: final.stop_reason,
      };
    } catch (error) {
      if (signal.aborted) return { type: "interrupted", partialText };
      throw error;
    }
  }
}

// ---------------------------------------------------------------------------
// Mock driver
// ---------------------------------------------------------------------------

const MOCK_THINKING = [
  "Reading the request and checking what the group already has in the workspace.",
  "Two people are in this session, so I should be explicit about whose request I am acting on.",
  "Sketching the shape of the answer before writing it out.",
];

function sleep(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) return reject(new DOMException("aborted", "AbortError"));
    const timer = setTimeout(() => {
      signal.removeEventListener("abort", onAbort);
      resolve();
    }, ms);
    const onAbort = () => {
      clearTimeout(timer);
      reject(new DOMException("aborted", "AbortError"));
    };
    signal.addEventListener("abort", onAbort, { once: true });
  });
}

/** Split into word-ish chunks so the mock stream reads like real token output. */
function chunk(text: string): string[] {
  return text.match(/\S+\s*/g) ?? [];
}

function lastUserText(messages: Anthropic.MessageParam[]): string {
  for (let i = messages.length - 1; i >= 0; i--) {
    const m = messages[i];
    if (!m || m.role !== "user") continue;
    if (typeof m.content === "string") return m.content;
    const text = m.content
      .filter((b): b is Anthropic.TextBlockParam => b.type === "text")
      .map((b) => b.text)
      .join(" ");
    if (text) return text;
  }
  return "";
}

function endsWithToolResult(messages: Anthropic.MessageParam[]): boolean {
  const last = messages.at(-1);
  if (!last || last.role !== "user" || typeof last.content === "string") return false;
  return last.content.some((b) => b.type === "tool_result");
}

class MockDriver implements AgentDriver {
  readonly mock = true;
  readonly model = "mock-agent";
  private counter = 0;

  async runTurn(
    messages: Anthropic.MessageParam[],
    handlers: TurnHandlers,
    signal: AbortSignal,
  ): Promise<TurnOutcome> {
    let partialText = "";
    const emit = async (text: string, delayMs: number) => {
      for (const piece of chunk(text)) {
        await sleep(delayMs, signal);
        partialText += piece;
        handlers.onText(piece);
      }
    };

    try {
      const wrappingUp = endsWithToolResult(messages);
      const ask = lastUserText(messages).replace(/^\[[^\]]+\]\s*/, "").trim();

      if (wrappingUp) {
        await emit(
          "Done - the file is in the shared workspace, so everyone in this session can open it. " +
            "Tell me what to change and I'll revise it in place.",
          22,
        );
        return { type: "complete", content: [{ type: "text", text: partialText }], toolUses: [], stopReason: "end_turn" };
      }

      for (const line of MOCK_THINKING.slice(0, 2 + (this.counter % 2))) {
        await sleep(280, signal);
        handlers.onThinking(line + "\n");
      }

      // Short asks get a plain reply; longer ones get a workspace artifact, which
      // is what exercises the shared approval path.
      const proposeWrite = ask.length > 12;

      await emit(
        proposeWrite
          ? `Working on it: "${ask.slice(0, 80)}". I'll put the result in the shared workspace so ` +
              `everyone here can see it rather than burying it in chat.`
          : `Got it${ask ? ` - "${ask}"` : ""}. Anything you want me to take further?`,
        22,
      );

      if (!proposeWrite) {
        return { type: "complete", content: [{ type: "text", text: partialText }], toolUses: [], stopReason: "end_turn" };
      }

      this.counter += 1;
      const toolUse: ToolUse = {
        id: `mock_toolu_${Date.now().toString(36)}_${this.counter}`,
        name: "write_file",
        input: {
          path: `notes-${this.counter}.md`,
          content: `# Session notes ${this.counter}\n\nRequest: ${ask}\n\n- Captured at ${new Date().toISOString()}\n- Written by the shared agent, visible to every participant.\n`,
        },
      };

      return {
        type: "complete",
        content: [
          { type: "text", text: partialText },
          { type: "tool_use", id: toolUse.id, name: toolUse.name, input: toolUse.input },
        ],
        toolUses: [toolUse],
        stopReason: "tool_use",
      };
    } catch (error) {
      if (signal.aborted) return { type: "interrupted", partialText };
      throw error;
    }
  }
}

// ---------------------------------------------------------------------------

export function createDriver(): AgentDriver {
  const hasKey = Boolean(process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN);
  if (!hasKey) {
    console.log(
      "[agent] No ANTHROPIC_API_KEY found - running the scripted mock agent.\n" +
        "        Set ANTHROPIC_API_KEY and restart to use " +
        MODEL +
        ".",
    );
    return new MockDriver();
  }
  console.log(`[agent] Using ${MODEL} via the Anthropic API.`);
  return new AnthropicDriver();
}
