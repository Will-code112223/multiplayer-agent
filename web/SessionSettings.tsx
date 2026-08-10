import { useEffect, useState } from "react";
import type { SessionConfig } from "../shared/protocol.ts";

/**
 * Per-session agent settings.
 *
 * Changes are refused by the server while a turn is in flight, so the whole
 * popover goes read-only rather than letting someone click into a rejection.
 * Switching models is not free: it discards the prompt cache built up over the
 * conversation, and that cost is stated here rather than hidden.
 */
export function SessionSettings({
  config,
  models,
  idle,
  observing,
  onChange,
  onClose,
}: {
  config: SessionConfig;
  models: string[];
  idle: boolean;
  observing: boolean;
  onChange: (patch: Partial<SessionConfig>) => void;
  onClose: () => void;
}) {
  const [prompt, setPrompt] = useState(config.systemPromptExtra);
  // Observers can read the settings but not change them, so the controls are
  // locked rather than left clickable into a refusal.
  const editable = idle && !observing;

  // Someone else may have edited it while this was open.
  useEffect(() => setPrompt(config.systemPromptExtra), [config.systemPromptExtra]);

  return (
    <div className="settings" role="dialog" aria-label="Session settings">
      <header className="settings-head">
        <h2>Agent settings</h2>
        <button className="btn btn-ghost" onClick={onClose} aria-label="Close settings">
          ✕
        </button>
      </header>

      {!editable && (
        <p className="settings-locked">
          {observing
            ? "You're observing. Join in as a participant to change these."
            : "The agent is working. Stop it before changing settings."}
        </p>
      )}

      <label className="settings-label" htmlFor="model-select">
        Model
      </label>
      <select
        id="model-select"
        className="settings-input"
        value={config.model}
        disabled={!editable}
        onChange={(e) => onChange({ model: e.target.value })}
      >
        {models.map((m) => (
          <option key={m} value={m}>
            {m}
          </option>
        ))}
      </select>
      <p className="settings-hint">
        Switching discards the prompt cache for this conversation, so the next turn re-reads the
        whole history at full price. Everyone in the session sees the change.
      </p>

      <label className="settings-toggle">
        <input
          type="checkbox"
          checked={config.webSearch}
          disabled={!editable}
          onChange={(e) => onChange({ webSearch: e.target.checked })}
        />
        <span>
          <strong>Web search</strong>
          <span className="settings-hint">
            Lets the agent look things up. Searches are billed per use.
          </span>
        </span>
      </label>

      <label className="settings-label" htmlFor="prompt-extra">
        Session instructions
      </label>
      <textarea
        id="prompt-extra"
        className="settings-input settings-textarea"
        value={prompt}
        disabled={!editable}
        maxLength={4000}
        placeholder="Anything the agent should keep in mind for this session…"
        onChange={(e) => setPrompt(e.target.value)}
      />
      <button
        className="btn"
        disabled={!editable || prompt === config.systemPromptExtra}
        onClick={() => onChange({ systemPromptExtra: prompt })}
      >
        Save instructions
      </button>
    </div>
  );
}
