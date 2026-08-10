import type { ServerConfig, SessionSummary, WorkspaceFile } from "../shared/protocol.ts";

/**
 * REST calls to the session server.
 *
 * The access code, when the server requires one, rides on every request from
 * here. Keeping it in one module means no call site can forget it.
 */

const CODE_KEY = "mpgpt.code";

export function loadCode(): string {
  try {
    return localStorage.getItem(CODE_KEY) ?? "";
  } catch {
    return "";
  }
}

export function saveCode(code: string): void {
  try {
    localStorage.setItem(CODE_KEY, code);
  } catch {
    // storage unavailable; the code lives only for this page load
  }
}

export class Unauthorized extends Error {
  constructor() {
    super("access code required");
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const code = loadCode();
  const res = await fetch(path, {
    ...init,
    headers: { ...(init?.headers ?? {}), ...(code ? { "x-access-code": code } : {}) },
  });
  if (res.status === 401) throw new Unauthorized();
  if (!res.ok) throw new Error(`${path} returned ${res.status}`);
  return (await res.json()) as T;
}

/** Unauthenticated: tells the client whether to show the code screen at all. */
export async function getServerConfig(): Promise<ServerConfig> {
  const res = await fetch("/api/config");
  if (!res.ok) throw new Error(`/api/config returned ${res.status}`);
  return (await res.json()) as ServerConfig;
}

export function listSessions(): Promise<{ mock: boolean; sessions: SessionSummary[] }> {
  return request("/api/sessions");
}

export function createSession(): Promise<SessionSummary> {
  return request("/api/sessions", { method: "POST" });
}

export function getSession(id: string): Promise<SessionSummary> {
  return request(`/api/sessions/${encodeURIComponent(id)}`);
}

export function listFiles(sessionId: string): Promise<{ files: WorkspaceFile[] }> {
  return request(`/api/sessions/${encodeURIComponent(sessionId)}/files`);
}

export async function readFile(sessionId: string, filePath: string): Promise<string> {
  const encoded = filePath.split("/").map(encodeURIComponent).join("/");
  const code = loadCode();
  const res = await fetch(`/api/sessions/${encodeURIComponent(sessionId)}/files/${encoded}`, {
    headers: code ? { "x-access-code": code } : {},
  });
  if (res.status === 401) throw new Unauthorized();
  if (!res.ok) throw new Error(`could not read ${filePath}`);
  return await res.text();
}

/** Download URL for a workspace file. Carries the code as a query param, since
 *  a plain link cannot set a header. */
export function fileDownloadUrl(sessionId: string, filePath: string): string {
  const encoded = filePath.split("/").map(encodeURIComponent).join("/");
  const code = loadCode();
  const suffix = code ? `?code=${encodeURIComponent(code)}` : "";
  return `/api/sessions/${encodeURIComponent(sessionId)}/files/${encoded}${suffix}`;
}
