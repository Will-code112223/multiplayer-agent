import fs from "node:fs/promises";
import path from "node:path";
import type Anthropic from "@anthropic-ai/sdk";

/**
 * Tools the shared agent can call.
 *
 * The workspace is per-session and deliberately visible to everyone in that
 * session: it is the artifact a group gathers around. `write_file` requires an
 * approval from any participant, which is what makes the approval step a
 * multiplayer primitive rather than a modal only the owner can see.
 */

const WORKSPACE_ROOT = path.resolve(process.cwd(), "workspace");

export interface ToolSpec {
  definition: Anthropic.Tool;
  /** Tools with side effects pause the run until a participant decides. */
  requiresApproval: boolean;
  run(input: Record<string, unknown>, sessionId: string): Promise<string>;
}

export async function sessionWorkspace(sessionId: string): Promise<string> {
  const dir = path.join(WORKSPACE_ROOT, sessionId);
  await fs.mkdir(dir, { recursive: true });
  return dir;
}

/**
 * Resolve a model-supplied path inside the session workspace.
 *
 * The path comes from model output, so it is untrusted: resolve to canonical
 * form and reject anything that escapes the session directory.
 */
async function resolveInWorkspace(sessionId: string, rel: unknown): Promise<string> {
  if (typeof rel !== "string" || rel.length === 0) {
    throw new Error("path must be a non-empty string");
  }
  const root = await sessionWorkspace(sessionId);
  const target = path.resolve(root, rel);
  const rootWithSep = root.endsWith(path.sep) ? root : root + path.sep;
  if (target !== root && !target.startsWith(rootWithSep)) {
    throw new Error(`path escapes the session workspace: ${rel}`);
  }
  return target;
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

export const TOOLS: Record<string, ToolSpec> = {
  list_files: listFiles,
  read_file: readFile,
  write_file: writeFile,
};

export const TOOL_DEFINITIONS: Anthropic.Tool[] = Object.values(TOOLS).map(
  (t) => t.definition,
);
