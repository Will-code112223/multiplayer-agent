import { useEffect, useState } from "react";
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

export function App() {
  const sessionId = useRoute();
  return sessionId ? <Room key={sessionId} sessionId={sessionId} /> : <Lobby />;
}
