import { useEffect, useRef, useState } from "react";
import type { ClientEvent, RunState } from "../shared/protocol.ts";

export function Composer({
  run,
  disabled,
  send,
}: {
  run: RunState;
  disabled: boolean;
  send: (event: ClientEvent) => void;
}) {
  const [text, setText] = useState("");
  const area = useRef<HTMLTextAreaElement>(null);
  const typing = useRef(false);
  const typingTimer = useRef<number | undefined>(undefined);

  const busy = run.status !== "idle";

  useEffect(() => {
    const el = area.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }, [text]);

  const setTyping = (value: boolean) => {
    if (typing.current === value) return;
    typing.current = value;
    send({ t: "typing", typing: value });
  };

  const onChange = (value: string) => {
    setText(value);
    setTyping(value.length > 0);
    window.clearTimeout(typingTimer.current);
    typingTimer.current = window.setTimeout(() => setTyping(false), 2500);
  };

  const submit = (mode: "say" | "steer") => {
    const body = text.trim();
    if (!body) return;
    send(mode === "steer" ? { t: "steer", text: body } : { t: "say", text: body });
    setText("");
    setTyping(false);
    area.current?.focus();
  };

  return (
    <div className="composer">
      <div className="composer-inner">
        {busy && (
          <div className="composer-banner">
            <span className="live-dot" />
            <span>
              {run.status === "awaiting-approval"
                ? "Agent is waiting on a tool decision"
                : `Agent is working${run.startedBy ? ` on ${run.startedBy.name}'s request` : ""}`}
              {run.queued > 0 && ` · ${run.queued} message${run.queued === 1 ? "" : "s"} queued`}
            </span>
            <button className="btn btn-stop" onClick={() => send({ t: "interrupt" })}>
              Stop
            </button>
          </div>
        )}

        <div className="composer-row">
          <textarea
            ref={area}
            className="composer-input"
            rows={1}
            value={text}
            disabled={disabled}
            placeholder={
              disabled
                ? "Reconnecting…"
                : busy
                  ? "Add to the queue, or steer to cut in now…"
                  : "Message the shared agent…"
            }
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit("say");
              }
            }}
          />
          <div className="composer-actions">
            {busy && (
              <button
                className="btn btn-steer"
                disabled={disabled || !text.trim()}
                onClick={() => submit("steer")}
                title="Interrupt the agent and redirect it with this message"
              >
                Steer
              </button>
            )}
            <button
              className="btn btn-primary"
              disabled={disabled || !text.trim()}
              onClick={() => submit("say")}
            >
              {busy ? "Queue" : "Send"}
            </button>
          </div>
        </div>
        <p className="composer-hint">
          Enter to {busy ? "queue" : "send"} · Shift+Enter for a new line
          {busy && " · Steer interrupts and redirects immediately"}
        </p>
      </div>
    </div>
  );
}
