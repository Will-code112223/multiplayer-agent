import { useEffect, useState } from "react";
import type { WorkspaceFile } from "../shared/protocol.ts";
import { fileDownloadUrl, readFile } from "./api.ts";
import { Markdown } from "./Markdown.tsx";

function humanSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

/** Every file the agent has written, in one place the whole session can open. */
export function WorkspacePanel({
  sessionId,
  files,
  open,
  onClose,
}: {
  sessionId: string;
  files: WorkspaceFile[];
  open: boolean;
  onClose: () => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [content, setContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!selected) return;
    let cancelled = false;
    setContent(null);
    setError(null);
    readFile(sessionId, selected)
      .then((text) => !cancelled && setContent(text))
      .catch((e) => !cancelled && setError(e instanceof Error ? e.message : String(e)));
    return () => {
      cancelled = true;
    };
  }, [sessionId, selected]);

  // A file being rewritten while open should show the new contents.
  useEffect(() => {
    if (!selected) return;
    const still = files.find((f) => f.path === selected);
    if (!still) setSelected(null);
  }, [files, selected]);

  if (!open) return null;

  return (
    <aside className="workspace">
      <header className="workspace-head">
        <div>
          <h2 className="workspace-title">Workspace</h2>
          <p className="workspace-sub">
            {files.length === 0
              ? "Nothing written yet"
              : `${files.length} file${files.length === 1 ? "" : "s"}, shared with everyone here`}
          </p>
        </div>
        <button className="btn btn-ghost" onClick={onClose} aria-label="Close workspace">
          ✕
        </button>
      </header>

      {files.length === 0 ? (
        <p className="workspace-empty">
          Ask the agent to write something down and it will appear here for the whole session.
        </p>
      ) : (
        <ul className="file-list">
          {files.map((f) => (
            <li key={f.path}>
              <button
                className="file-row"
                data-selected={f.path === selected || undefined}
                onClick={() => setSelected(f.path === selected ? null : f.path)}
              >
                <span className="file-name">{f.path}</span>
                <span className="file-meta">{humanSize(f.size)}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {selected && (
        <div className="file-viewer">
          <header className="file-viewer-head">
            <code>{selected}</code>
            <a className="btn btn-ghost" href={fileDownloadUrl(sessionId, selected)} download>
              Download
            </a>
          </header>
          {error && <p className="file-error">{error}</p>}
          {content === null && !error && <p className="file-loading">Loading…</p>}
          {content !== null &&
            (/\.(md|markdown)$/i.test(selected) ? (
              // Render Markdown rather than showing raw syntax.
              <div className="file-body file-body-md">
                <Markdown text={content} />
              </div>
            ) : (
              <pre className="file-body">{content}</pre>
            ))}
        </div>
      )}
    </aside>
  );
}
