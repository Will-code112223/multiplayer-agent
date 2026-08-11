import { useState } from "react";
import type { SessionConfig } from "../shared/protocol.ts";
import { Composer } from "./Composer.tsx";
import { JoinGate } from "./JoinGate.tsx";
import { Presence } from "./Presence.tsx";
import { SessionSettings } from "./SessionSettings.tsx";
import { Transcript } from "./Transcript.tsx";
import { WorkspacePanel } from "./WorkspacePanel.tsx";
import type { Identity } from "./useSession.ts";
import { loadIdentity, saveIdentity, useSession } from "./useSession.ts";

export function Room({ sessionId }: { sessionId: string }) {
  const [identity, setIdentity] = useState<Identity | null>(() => loadIdentity());
  const [editing, setEditing] = useState(false);
  const session = useSession(sessionId, identity);
  const [copied, setCopied] = useState(false);
  const [showFiles, setShowFiles] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Reopening keeps the same participant id, so a name or role change updates
  // you in place rather than rejoining as a stranger.
  if (!identity || editing) {
    return (
      <JoinGate
        sessionId={sessionId}
        initial={identity}
        onJoin={(next) => {
          saveIdentity(next);
          const returning = identity !== null;
          setIdentity(next);
          setEditing(false);
          if (returning) {
            session.send({ t: "rename", name: next.name, color: next.color });
            session.send({ t: "setRole", role: next.role });
          }
        }}
      />
    );
  }

  const copyLink = async () => {
    await navigator.clipboard.writeText(location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  const observing = session.me?.role === "observer";
  const idle = session.run.status === "idle";
  const changeConfig = (patch: Partial<SessionConfig>) => session.send({ t: "setConfig", config: patch });

  return (
    <div className="room" data-panel={showFiles || undefined}>
      <header className="topbar">
        <div className="topbar-left">
          <a className="brand" href="#/">
            multiplayer<span>gpt</span>
          </a>
          <span className="divider" />
          <h1 className="session-title" title={session.title}>
            {session.title}
          </h1>
          <span
            className="status-pill"
            data-status={session.run.status}
            data-connection={session.connection}
          >
            {session.connection === "unauthorized"
              ? "no access"
              : session.connection !== "open"
                ? "reconnecting"
                : session.run.status === "idle"
                  ? "idle"
                  : session.run.status === "running"
                    ? "running"
                    : "needs approval"}
          </span>
        </div>

        <div className="topbar-right">
          <button
            className="btn btn-ghost"
            onClick={() => setShowSettings((v) => !v)}
            title={session.config ? `Model: ${session.config.model}` : "Agent settings"}
          >
            {session.mock ? "mock agent" : (session.config?.model ?? "…")}
          </button>
          <button className="btn btn-ghost" onClick={() => setShowFiles((v) => !v)}>
            Files{session.files.length > 0 ? ` · ${session.files.length}` : ""}
          </button>
          <button
            className="btn btn-ghost"
            onClick={() => setEditing(true)}
            title="Change your name, colour or role"
          >
            {session.me?.name ?? identity.name}
            {observing ? " · observing" : ""}
          </button>
          <Presence participants={session.participants} typing={session.typing} me={session.me} />
          <button className="btn btn-ghost" onClick={copyLink}>
            {copied ? "Copied" : "Copy link"}
          </button>
        </div>
      </header>

      <Transcript
        entries={session.entries}
        onDecide={(entryId, approve) => session.send({ t: "decide", entryId, approve })}
      />

      {showFiles && (
        <WorkspacePanel
          sessionId={sessionId}
          files={session.files}
          open={showFiles}
          onClose={() => setShowFiles(false)}
        />
      )}

      {showSettings && session.config && (
        <SessionSettings
          config={session.config}
          models={session.models}
          idle={idle}
          observing={observing}
          onChange={changeConfig}
          onClose={() => setShowSettings(false)}
        />
      )}

      {session.denied && <div className="toast toast-denied">{session.denied}</div>}

      <Composer
        run={session.run}
        disabled={session.connection !== "open"}
        observing={observing}
        send={session.send}
      />
    </div>
  );
}
