import { useCallback, useEffect, useState } from "react";
import { AccessGate } from "./AccessGate.tsx";
import { getServerConfig, listSessions, loadCode, Unauthorized } from "./api.ts";
import { Lobby } from "./Lobby.tsx";
import { Room } from "./Room.tsx";

/** Hash routing keeps the session id in a link anyone can paste to a teammate. */
function useRoute(): string | null {
  const read = () => {
    const match = location.hash.match(/^#\/s\/([A-Za-z0-9_-]{1,64})$/);
    return match?.[1] ?? null;
  };
  const [sessionId, setSessionId] = useState<string | null>(read);
  useEffect(() => {
    const onHashChange = () => setSessionId(read());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);
  return sessionId;
}

type Access = "checking" | "locked" | "open";

export function App() {
  const sessionId = useRoute();
  const [access, setAccess] = useState<Access>("checking");

  const check = useCallback(async () => {
    try {
      const config = await getServerConfig();
      if (!config.authRequired) return setAccess("open");
      // A stored code from a previous visit skips the gate.
      if (!loadCode()) return setAccess("locked");
      await listSessions();
      setAccess("open");
    } catch (error) {
      setAccess(error instanceof Unauthorized ? "locked" : "open");
    }
  }, []);

  useEffect(() => {
    void check();
  }, [check]);

  if (access === "checking") return <div className="gate" />;
  if (access === "locked") return <AccessGate onUnlocked={() => setAccess("open")} />;
  return sessionId ? <Room key={sessionId} sessionId={sessionId} /> : <Lobby />;
}
