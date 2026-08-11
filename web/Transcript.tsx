import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { AgentEntry, Entry, ToolEntry, UserEntry } from "../shared/protocol.ts";
import { Markdown } from "./Markdown.tsx";
import { Avatar } from "./Presence.tsx";

function time(at: number): string {
  return new Date(at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function UserBubble({ entry }: { entry: UserEntry }) {
  return (
    <article className="entry entry-user" data-queued={entry.queued || undefined}>
      <Avatar participant={entry.author} />
      <div className="entry-body">
        <header className="entry-head">
          <span className="entry-author" data-color={entry.author.color}>
            {entry.author.name}
          </span>
          <span className="entry-time">{time(entry.at)}</span>
          {entry.queued && <span className="chip chip-queued">queued</span>}
        </header>
        {/* Shown as typed: people write plain text, not Markdown. */}
        <p className="entry-text">{entry.text}</p>
      </div>
    </article>
  );
}

function Thinking({ text, live }: { text: string; live: boolean }) {
  const [open, setOpen] = useState(false);
  if (!text.trim()) return null;
  return (
    <div className="thinking" data-open={open || undefined}>
      <button className="thinking-toggle" onClick={() => setOpen((v) => !v)}>
        <span className="thinking-dot" data-live={live || undefined} />
        {open ? "Hide reasoning" : live ? "Thinking…" : "Show reasoning"}
      </button>
      {open && <div className="thinking-body">{text}</div>}
    </div>
  );
}

function AgentBubble({ entry }: { entry: AgentEntry }) {
  const streaming = entry.status === "streaming";
  return (
    <article className="entry entry-agent" data-status={entry.status}>
      <span className="avatar avatar-agent" title="Shared agent">
        ✦
      </span>
      <div className="entry-body">
        <header className="entry-head">
          <span className="entry-author entry-author-agent">Agent</span>
          <span className="entry-time">{time(entry.at)}</span>
          {entry.model && <span className="entry-model">{entry.model}</span>}
          {entry.status === "interrupted" && (
            <span className="chip chip-stop">
              stopped{entry.interruptedBy ? ` by ${entry.interruptedBy.name}` : ""}
            </span>
          )}
          {entry.status === "error" && <span className="chip chip-error">error</span>}
        </header>
        <Thinking text={entry.thinking} live={streaming} />
        {entry.text && (
          <div className="entry-md" data-streaming={streaming || undefined}>
            <Markdown text={entry.text} />
          </div>
        )}
        {!entry.text && streaming && (
          <p className="entry-text entry-muted">
            <span className="dots">
              <i />
              <i />
              <i />
            </span>
          </p>
        )}
        {entry.error && <p className="entry-error">{entry.error}</p>}
      </div>
    </article>
  );
}

/** One-line summary, so a collapsed card still says what it does. */
function toolSummary(entry: ToolEntry): string | null {
  const input = entry.input as Record<string, unknown> | null;
  if (!input || typeof input !== "object") return null;
  const path = typeof input.path === "string" ? input.path : null;
  if (entry.name === "write_file" && path) {
    const size = typeof input.content === "string" ? input.content.length : 0;
    return `${path} · ${size.toLocaleString()} chars`;
  }
  if (path) return path;
  if (typeof input.query === "string") return input.query;
  return null;
}

function ToolCard({
  entry,
  onDecide,
}: {
  entry: ToolEntry;
  onDecide: (approve: boolean) => void;
}) {
  const pending = entry.status === "pending-approval";
  const json = JSON.stringify(entry.input, null, 2);
  // Pending calls need their detail visible; settled ones collapse so a file
  // body does not bury the conversation.
  const [open, setOpen] = useState(pending);
  const summary = toolSummary(entry);

  return (
    <article className="entry entry-tool">
      <span className="avatar avatar-tool" title="Tool call">
        ⌘
      </span>
      <div className="entry-body">
        <div className="tool-card" data-status={entry.status}>
          <button className="tool-head" onClick={() => setOpen((v) => !v)}>
            <span className="tool-caret" data-open={open || undefined}>
              ›
            </span>
            <code className="tool-name">{entry.name}</code>
            {summary && <span className="tool-summary">{summary}</span>}
            <span className="tool-status">{entry.status.replace("-", " ")}</span>
          </button>

          {open && <pre className="tool-input">{json}</pre>}
          {open && entry.output && <pre className="tool-output">{entry.output}</pre>}

          {pending && (
            <div className="tool-actions">
              <span className="tool-prompt">Anyone here can decide.</span>
              <button className="btn btn-approve" onClick={() => onDecide(true)}>
                Approve
              </button>
              <button className="btn btn-deny" onClick={() => onDecide(false)}>
                Deny
              </button>
            </div>
          )}
          {entry.decidedBy && !pending && (
            <footer className="tool-decided">
              <Avatar participant={entry.decidedBy} size={18} />
              <span>
                {entry.status === "denied" ? "denied" : "approved"} by {entry.decidedBy.name}
              </span>
            </footer>
          )}
        </div>
      </div>
    </article>
  );
}

export function Transcript({
  entries,
  onDecide,
}: {
  entries: Entry[];
  onDecide: (entryId: string, approve: boolean) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const stick = useRef(true);

  // Follow the stream, unless the reader has scrolled up.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onScroll = () => {
      stick.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  useLayoutEffect(() => {
    const el = ref.current;
    if (el && stick.current) el.scrollTop = el.scrollHeight;
  });

  return (
    <div className="transcript" ref={ref}>
      <div className="transcript-inner">
        {/* Join/leave notices alone do not count as a started session. */}
        {entries.every((e) => e.kind === "system") && (
          <div className="empty">
            <h2>Nobody has said anything yet.</h2>
            <p>
              Send a message to start the agent. Share this URL and whoever opens it lands in
              the same live session - they can watch it work, interrupt it, and approve its
              tool calls.
            </p>
          </div>
        )}
        {entries.map((entry) => {
          switch (entry.kind) {
            case "user":
              return <UserBubble key={entry.id} entry={entry} />;
            case "agent":
              return <AgentBubble key={entry.id} entry={entry} />;
            case "tool":
              return (
                <ToolCard
                  key={entry.id}
                  entry={entry}
                  onDecide={(approve) => onDecide(entry.id, approve)}
                />
              );
            case "system":
              return (
                <p key={entry.id} className="entry-system">
                  {entry.text}
                </p>
              );
          }
        })}
      </div>
    </div>
  );
}
