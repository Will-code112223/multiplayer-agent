import fs from "node:fs";
import path from "node:path";
import type http from "node:http";

/**
 * Serves the built client in production.
 *
 * In development Vite serves the client on its own port and proxies to this
 * server, so this handler stays inactive unless `dist/` exists. In production
 * one process serves the page, the REST endpoints and the WebSocket, which
 * means a single origin and a single port - the only shape that survives being
 * put behind a tunnel or a hosting platform.
 */

const DIST = path.resolve(process.cwd(), "dist");

const MIME: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".map": "application/json; charset=utf-8",
};

export const hasBuild = fs.existsSync(path.join(DIST, "index.html"));

/** @returns true when the request was handled. */
export function serveStatic(
  req: http.IncomingMessage,
  res: http.ServerResponse,
  pathname: string,
): boolean {
  if (!hasBuild) return false;
  if (req.method !== "GET" && req.method !== "HEAD") return false;

  // The path comes off the wire, so resolve to canonical form and confirm the
  // result is still inside dist. Checking the raw string would miss `..`,
  // symlinks, and percent-encoded traversal.
  let requested: string | null = null;
  try {
    const candidate = path.resolve(DIST, `.${decodeURIComponent(pathname)}`);
    if (candidate === DIST || candidate.startsWith(DIST + path.sep)) requested = candidate;
  } catch {
    requested = null; // malformed percent-encoding
  }

  const file =
    requested && fs.existsSync(requested) && fs.statSync(requested).isFile()
      ? requested
      : // Routing is client-side, so anything unrecognized falls back to the shell.
        path.join(DIST, "index.html");

  const isShell = file === path.join(DIST, "index.html");
  res.writeHead(200, {
    "content-type": MIME[path.extname(file)] ?? "application/octet-stream",
    // Vite fingerprints asset filenames, so those cache forever. The shell must
    // not, or clients pin themselves to a stale build.
    "cache-control": isShell ? "no-cache" : "public, max-age=31536000, immutable",
  });

  if (req.method === "HEAD") {
    res.end();
    return true;
  }
  fs.createReadStream(file).pipe(res);
  return true;
}
