import { useCallback, useEffect, useState } from "react";
import type { SessionSummary } from "../shared/protocol.ts";
import { createSession, listSessions } from "./api.ts";
import { Avatar } from "./Presence.tsx";

export function Lobby() {
  const [sessions, setSessions] = useState<SessionSummary[] | null>(null);
  const [mock, setMock] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const listing = await listSessions();
      setSessions(listing.sessions);
      setMock(listing.mock);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }, []);

  useEffect(() => {
    void refresh();
    const timer = setInterval(refresh, 3000);
    return () => clearInterval(timer);
  }, [refresh]);

  const create = async () => {
    const summary = await createSession();
    location.hash = `#/s/${summary.id}`;
  };

  return (
    <div className="lobby">
      <div className="lobby-inner">
        <header className="lobby-head">
          <h1 className="brand brand-lg">
            multiplayer<span>gpt</span>
          </h1>
          <p className="lobby-sub">
            One agent, many people. Open a session, share the link, and everyone who joins can
            watch it work, cut in mid-task, and approve its tool calls.
          </p>
          <button className="btn btn-primary btn-lg" onClick={() => void create()}>
            Start a session
          </button>
          {mock && (
            <p className="lobby-note">
              No <code>ANTHROPIC_API_KEY</code> in the environment, so the server is running a
              scripted mock agent. Set the key and restart to use a real model.
            </p>
          )}
        </header>

        {error && <p className="lobby-error">Can’t reach the server: {error}</p>}

        <section className="lobby-list">
          <h2>Sessions</h2>
          {sessions && sessions.length === 0 && (
            <p className="lobby-empty">No sessions yet. Start one above.</p>
          )}
          <ul>
            {sessions?.map((s) => (
              <li key={s.id}>
                <a className="session-card" href={`#/s/${s.id}`}>
                  <div className="session-card-main">
                    <span className="session-card-title">{s.title}</span>
                    <span className="session-card-meta">
                      {s.entries} entr{s.entries === 1 ? "y" : "ies"} ·{" "}
                      {new Date(s.createdAt).toLocaleString([], {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <div className="session-card-right">
                    <div className="presence-stack">
                      {s.participants
                        .filter((p) => p.online)
                        .map((p, i) => (
                          <Avatar key={p.id} participant={p} size={24} stackIndex={i} />
                        ))}
                    </div>
                    <span className="status-pill" data-status={s.status}>
                      {s.status === "awaiting-approval" ? "needs approval" : s.status}
                    </span>
                  </div>
                </a>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
