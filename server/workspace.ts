import fs from "node:fs/promises";
import path from "node:path";
import type { WorkspaceFile } from "../shared/protocol.ts";

/**
 * The session's shared workspace on disk.
 *
 * Owns the only path-resolution guard: the agent's tools and the HTTP file
 * endpoints both route through `resolveInWorkspace`.
 */

const ROOT = path.resolve(process.cwd(), "workspace");

/** Deepest directory nesting we will walk when listing. */
const MAX_DEPTH = 8;

export async function sessionWorkspace(sessionId: string): Promise<string> {
  const dir = path.join(ROOT, sessionId);
  await fs.mkdir(dir, { recursive: true });
  return dir;
}

/**
 * Resolve an untrusted relative path inside one session's workspace.
 *
 * Resolves to canonical form before checking containment; a raw string check
 * would miss `..`, absolute paths and percent-encoded traversal.
 */
export async function resolveInWorkspace(sessionId: string, rel: unknown): Promise<string> {
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

/** Every file in the session's workspace, newest first. Directories are walked, not listed. */
export async function listWorkspace(sessionId: string): Promise<WorkspaceFile[]> {
  const root = await sessionWorkspace(sessionId);
  const found: WorkspaceFile[] = [];

  const walk = async (dir: string, depth: number): Promise<void> => {
    if (depth > MAX_DEPTH) return;
    const items = await fs.readdir(dir, { withFileTypes: true });
    for (const item of items) {
      const full = path.join(dir, item.name);
      if (item.isDirectory()) {
        await walk(full, depth + 1);
      } else if (item.isFile()) {
        const stat = await fs.stat(full);
        found.push({
          // Always POSIX-style, so the same string works as a URL segment.
          path: path.relative(root, full).split(path.sep).join("/"),
          size: stat.size,
          modifiedAt: stat.mtimeMs,
        });
      }
    }
  };

  try {
    await walk(root, 0);
  } catch {
    return [];
  }
  return found.sort((a, b) => b.modifiedAt - a.modifiedAt);
}

/** Read a workspace file as text, refusing anything outside the session. */
export async function readWorkspaceFile(sessionId: string, rel: string): Promise<string> {
  const file = await resolveInWorkspace(sessionId, rel);
  return await fs.readFile(file, "utf8");
}
