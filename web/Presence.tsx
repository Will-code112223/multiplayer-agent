import type { Participant } from "../shared/protocol.ts";

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "?";
  const second = parts.length > 1 ? (parts[1]?.[0] ?? "") : "";
  return (first + second).toUpperCase();
}

export function Avatar({
  participant,
  size = 28,
  title,
  stackIndex,
}: {
  participant: Participant;
  size?: number;
  title?: string;
  /** Position in an overlapping stack; earlier avatars paint on top. */
  stackIndex?: number;
}) {
  return (
    <span
      className="avatar"
      data-color={participant.color}
      data-offline={!participant.online || undefined}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.4,
        ...(stackIndex === undefined ? {} : { zIndex: 32 - stackIndex }),
      }}
      title={title ?? `${participant.name}${participant.online ? "" : " (disconnected)"}`}
    >
      {initials(participant.name)}
    </span>
  );
}

export function Presence({
  participants,
  typing,
  me,
}: {
  participants: Participant[];
  typing: Set<string>;
  me: Participant | null;
}) {
  const others = participants.filter((p) => p.id !== me?.id);
  const typingNames = participants
    .filter((p) => typing.has(p.id) && p.id !== me?.id)
    .map((p) => p.name);

  return (
    <div className="presence">
      <div className="presence-stack">
        {me && <Avatar participant={me} title={`${me.name} (you)`} stackIndex={0} />}
        {others.map((p, i) => (
          <Avatar key={p.id} participant={p} stackIndex={i + 1} />
        ))}
      </div>
      <span className="presence-label">
        {typingNames.length > 0
          ? `${typingNames.join(", ")} ${typingNames.length === 1 ? "is" : "are"} typing…`
          : participants.length === 1
            ? "Only you here"
            : `${participants.length} here`}
      </span>
    </div>
  );
}
