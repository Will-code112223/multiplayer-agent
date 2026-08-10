import { useEffect, useState } from "react";
import type { Role, SessionSummary } from "../shared/protocol.ts";
import { getSession } from "./api.ts";
import { Avatar } from "./Presence.tsx";
import type { Identity } from "./useSession.ts";
import { randomName } from "./useSession.ts";

/**
 * The screen in front of every room: choose who you are before you appear.
 *
 * It shows who is already inside, fetched over REST rather than by opening a
 * socket, so nobody sees you arrive until you have actually decided to join.
 */
export function JoinGate({
  sessionId,
  initial,
  onJoin,
}: {
  sessionId: string;
  initial: Identity | null;
  onJoin: (identity: Identity) => void;
}) {
  const [name, setName] = useState(initial?.name ?? randomName());
  const [color, setColor] = useState(initial?.color ?? Math.floor(Math.random() * 8));
  const [role, setRole] = useState<Role>(initial?.role ?? "participant");
  const [preview, setPreview] = useState<SessionSummary | null>(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getSession(sessionId)
      .then((s) => !cancelled && setPreview(s))
      .catch(() => !cancelled && setMissing(true));
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  const submit = () => {
    const trimmed = name.trim().slice(0, 32);
    if (!trimmed) return;
    onJoin({
      participantId: initial?.participantId ?? crypto.randomUUID(),
      name: trimmed,
      color,
      role,
    });
  };

  const inside = preview?.participants.filter((p) => p.online) ?? [];

  return (
    <div className="gate">
      <div className="gate-card">
        <header className="gate-head">
          <span className="gate-eyebrow">Joining</span>
          <h1 className="gate-title">
            {missing ? "New session" : (preview?.title ?? "Loading…")}
          </h1>
          <p className="gate-sub">
            {inside.length === 0
              ? "Nobody else is here yet. You'll be first."
              : `${inside.length} ${inside.length === 1 ? "person is" : "people are"} already inside.`}
          </p>
          {inside.length > 0 && (
            <div className="presence-stack gate-stack">
              {inside.map((p, i) => (
                <Avatar key={p.id} participant={p} size={30} stackIndex={i} />
              ))}
            </div>
          )}
        </header>

        <label className="gate-label" htmlFor="join-name">
          Your name
        </label>
        <input
          id="join-name"
          className="gate-input"
          value={name}
          maxLength={32}
          autoFocus
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="What should people call you?"
        />

        <span className="gate-label">Your colour</span>
        <div className="swatches">
          {Array.from({ length: 8 }, (_, i) => (
            <button
              key={i}
              type="button"
              className="swatch"
              data-color={i}
              data-selected={i === color || undefined}
              aria-label={`Colour ${i + 1}`}
              onClick={() => setColor(i)}
            />
          ))}
        </div>

        <span className="gate-label">How are you joining?</span>
        <div className="role-choice">
          <button
            type="button"
            className="role-option"
            data-selected={role === "participant" || undefined}
            onClick={() => setRole("participant")}
          >
            <strong>Participant</strong>
            <span>Send messages, interrupt the agent, approve its tool calls.</span>
          </button>
          <button
            type="button"
            className="role-option"
            data-selected={role === "observer" || undefined}
            onClick={() => setRole("observer")}
          >
            <strong>Observer</strong>
            <span>Watch it work live without being able to act.</span>
          </button>
        </div>

        <button className="btn btn-primary btn-lg gate-submit" disabled={!name.trim()} onClick={submit}>
          Join session
        </button>
        <p className="gate-foot">
          You can change your name, colour and role at any time once you're inside.
        </p>
      </div>
    </div>
  );
}
