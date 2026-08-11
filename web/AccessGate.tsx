import { useState } from "react";
import { listSessions, saveCode, Unauthorized } from "./api.ts";

/** Shared-passcode screen, shown only when the server sets ACCESS_CODE. */
export function AccessGate({ onUnlocked }: { onUnlocked: () => void }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  const submit = async () => {
    if (!code.trim() || checking) return;
    setChecking(true);
    setError(null);
    // Save first: the request helper reads the code from storage.
    saveCode(code.trim());
    try {
      await listSessions();
      onUnlocked();
    } catch (e) {
      saveCode("");
      setError(e instanceof Unauthorized ? "That code isn't right." : "Could not reach the server.");
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="gate">
      <div className="gate-card gate-card-narrow">
        <h1 className="brand brand-lg">
          multiplayer<span>gpt</span>
        </h1>
        <p className="gate-sub">This session server is private. Enter the code you were given.</p>

        <input
          className="gate-input"
          type="password"
          value={code}
          autoFocus
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && void submit()}
          placeholder="Access code"
          aria-label="Access code"
        />
        {error && <p className="gate-error">{error}</p>}

        <button
          className="btn btn-primary btn-lg gate-submit"
          disabled={!code.trim() || checking}
          onClick={() => void submit()}
        >
          {checking ? "Checking…" : "Unlock"}
        </button>
      </div>
    </div>
  );
}
