import { useState } from "react";
import { Composer } from "./Composer.tsx";
import { Presence } from "./Presence.tsx";
import { Transcript } from "./Transcript.tsx";
import { loadIdentity, saveIdentity, useSession } from "./useSession.ts";

export function Room({ sessionId }: { sessionId: string }) {
  const session = useSession(sessionId);
  const [copied, setCopied] = useState(false);
  const [name, setName] = useState(() => loadIdentity().name);

  const copyLink = async () => {
    await navigator.clipboard.writeText(location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  const commitName = () => {
    const next = name.trim().slice(0, 32);
    if (!next) {
      setName(loadIdentity().name);
      return;
    }
    saveIdentity({ ...loadIdentity(), name: next });
    session.send({ t: "rename", name: next });
  };

  return (
    <div className="room">
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
            {session.connection !== "open"
              ? session.connection === "connecting"
                ? "connecting"
                : "reconnecting"
              : session.run.status === "idle"
                ? "idle"
                : session.run.status === "running"
                  ? "running"
                  : "needs approval"}
          </span>
        </div>

        <div className="topbar-right">
          <span className="model-badge" title={session.mock ? "No API key found; the agent is scripted." : "Live model"}>
            {session.mock ? "mock agent" : session.model || "…"}
          </span>
          <input
            className="name-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={commitName}
            onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
            aria-label="Your display name"
            maxLength={32}
          />
          <Presence
            participants={session.participants}
            typing={session.typing}
            me={session.me}
          />
          <button className="btn btn-ghost" onClick={copyLink}>
            {copied ? "Copied" : "Copy link"}
          </button>
        </div>
      </header>

      <Transcript
        entries={session.entries}
        onDecide={(entryId, approve) => session.send({ t: "decide", entryId, approve })}
      />

      <Composer
        run={session.run}
        disabled={session.connection !== "open"}
        send={session.send}
      />
    </div>
  );
}
