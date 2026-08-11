import fs from "node:fs/promises";
import path from "node:path";
import type Anthropic from "@anthropic-ai/sdk";
import type { SessionConfig } from "../shared/protocol.ts";
import { resolveInWorkspace } from "./workspace.ts";

/**
 * Tools the shared agent can call.
 *
 * The workspace is per-session and visible to everyone in it. `write_file`
 * requires approval from any participant before it runs.
 */

/** One entry of the `tools` array on a Messages request. */
export type ToolDef = NonNullable<Anthropic.MessageCreateParams["tools"]>[number];

export interface ToolSpec {
  definition: Anthropic.Tool;
  /** Tools with side effects pause the run until a participant decides. */
  requiresApproval: boolean;
  run(input: Record<string, unknown>, sessionId: string): Promise<string>;
}

const listFiles: ToolSpec = {
  requiresApproval: false,
  definition: {
    name: "list_files",
    description:
      "List files and directories in the shared session workspace. Everyone in the session can see this workspace, so use it for anything the group should be able to inspect.",
    input_schema: {
      type: "object",
      properties: {
        path: {
          type: "string",
          description: "Directory relative to the workspace root. Defaults to the root.",
        },
      },
    },
  },
  async run(input, sessionId) {
    const dir = await resolveInWorkspace(sessionId, (input.path as string) || ".");
    const items = await fs.readdir(dir, { withFileTypes: true });
    if (items.length === 0) return "(empty)";
    return items
      .map((i) => (i.isDirectory() ? `${i.name}/` : i.name))
      .sort()
      .join("\n");
  },
};

const readFile: ToolSpec = {
  requiresApproval: false,
  definition: {
    name: "read_file",
    description: "Read a UTF-8 text file from the shared session workspace.",
    input_schema: {
      type: "object",
      properties: {
        path: { type: "string", description: "File path relative to the workspace root." },
      },
      required: ["path"],
    },
  },
  async run(input, sessionId) {
    const file = await resolveInWorkspace(sessionId, input.path);
    return await fs.readFile(file, "utf8");
  },
};

const writeFile: ToolSpec = {
  requiresApproval: true,
  definition: {
    name: "write_file",
    description:
      "Write a UTF-8 text file into the shared session workspace, creating parent directories as needed. Overwrites an existing file at the same path. Any participant must approve before this runs.",
    input_schema: {
      type: "object",
      properties: {
        path: { type: "string", description: "File path relative to the workspace root." },
        content: { type: "string", description: "Full file contents to write." },
      },
      required: ["path", "content"],
    },
  },
  async run(input, sessionId) {
    const file = await resolveInWorkspace(sessionId, input.path);
    const content = typeof input.content === "string" ? input.content : "";
    await fs.mkdir(path.dirname(file), { recursive: true });
    await fs.writeFile(file, content, "utf8");
    return `Wrote ${content.length} characters to ${input.path as string}`;
  },
};

/** Client-executed tools, keyed by the name the model calls. */
export const TOOLS: Record<string, ToolSpec> = {
  list_files: listFiles,
  read_file: readFile,
  write_file: writeFile,
};

/** Tools whose results change the workspace, so the file panel should refresh. */
export const WORKSPACE_MUTATING = new Set(["write_file"]);

/**
 * Web search runs server-side, so there is nothing to execute locally.
 *
 * The tool version is model-dependent; Haiku only supports the original.
 */
function webSearchTool(model: string): ToolDef {
  return model.startsWith("claude-haiku")
    ? ({ type: "web_search_20250305", name: "web_search", max_uses: 5 } as ToolDef)
    : ({ type: "web_search_20260209", name: "web_search", max_uses: 5 } as ToolDef);
}

/** The `tools` array for one request, given a session's settings. */
export function toolsFor(config: SessionConfig): ToolDef[] {
  const defs: ToolDef[] = Object.values(TOOLS).map((t) => t.definition as ToolDef);
  if (config.webSearch) defs.push(webSearchTool(config.model));
  return defs;
}
