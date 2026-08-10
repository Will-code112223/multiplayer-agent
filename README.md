# multiplayergpt

A prototype of a shared agent session: one agent, many people, one live transcript.

Open a session, share the URL, and anyone who opens it lands in the same running session.
They can watch the agent work token by token, send it messages while it is mid-task, interrupt it, redirect it, and approve or deny its tool calls.
Every action is attributed, so the group can see who steered and who approved.

Runs with no credentials out of the box against a scripted mock agent.
Set `ANTHROPIC_API_KEY` and it uses `claude-opus-5` instead, with no other changes.

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:5173, start a session, and paste the URL into a second browser window.

To play both sides from one browser, add `?as=Name` to the URL.
Without it every tab shares one stored identity and shows up as the same person:

```
http://localhost:5173/?as=Boris#/s/<session-id>
```

## API keys

Put the key in a `.env` file in the project root:

```
ANTHROPIC_API_KEY=sk-ant-...
```

`.env` is gitignored. The server reads it at startup (`server/env.ts`), so **restart `npm run dev` after creating or editing it** - the file is not watched.
On startup the server prints which agent it is using, so you can confirm the key was picked up:

```
[env] loaded .env
[agent] Using claude-opus-5 via the Anthropic API.
```

Exporting the variable in your shell works too, and takes precedence over nothing in particular - either way the SDK reads `process.env`:

```bash
export ANTHROPIC_API_KEY=sk-ant-...
npm run dev
```

The key never leaves the server.
The browser talks only to this server, and this server talks to Anthropic.
Do not put the key in anything under `web/`, or in a `VITE_`-prefixed variable: Vite inlines those into the JavaScript bundle, where anyone who opens the page can read them.

Other scripts: `npm test` (protocol test, no credentials needed), `npm run typecheck`, `npm run build`.

## Sharing a link with other people

`npm run dev` runs two servers (Vite for the page, Node for the agent) on two ports, which does not survive being put behind a tunnel.
For anything other people need to reach, build once and run the single-port server instead.
It serves the page, the REST endpoints and the WebSocket from one origin:

```bash
npm run build && npm start
```

That listens on `PORT` (default 8787) and binds `0.0.0.0`.
Rebuild after any change to `web/`; `npm start` serves whatever is in `dist/`.

**Same network.** Anyone on your Wi-Fi can use `http://<your-lan-ip>:8787`.

**Anywhere.** Put a tunnel in front of it:

```bash
cloudflared tunnel --url http://localhost:8787
```

It prints a `https://<random-words>.trycloudflare.com` URL that anyone can open.
WebSockets work over it, so live streaming, interrupts and shared approvals all behave exactly as they do locally.
Stop the tunnel with `Ctrl+C`; the URL dies with it, and a new one is issued each time.

> The link is unauthenticated by design in this prototype.
> Anyone who has it can spend your API credits and approve the agent's `write_file` calls, which land in `workspace/<session-id>` inside this project.
> Hand it out for a test, then stop the tunnel.

## What is actually multiplayer here

Streaming the same tokens to several browsers is the easy part.
The parts that make a session genuinely shared are the ones where two people can act on the same agent at the same time.

**Anyone can send, any time.** A message sent while the agent is busy is not rejected and does not start a competing turn.
It is shown to everyone as queued and delivered at the next legal turn boundary.
Because tool results must be the immediately following user turn, queued messages ride along in that same turn rather than waiting for the whole run to finish.

**Anyone can interrupt.** Stop aborts the in-flight stream from any participant's browser.
Whatever the agent had already produced is kept in the conversation so the history stays coherent, and the transcript records who stopped it.

**Anyone can steer.** Steer is interrupt-and-redirect in one action: it aborts the current turn and immediately starts a new one with your instructions, instead of making you stop, wait, and retype.

**Anyone can approve a tool call.** `write_file` pauses the run and asks the session, not the person who happened to send the last message.
The transcript records the decision and who made it.

**Anyone can join late or reconnect.** Every state change is an event with a monotonic sequence number.
A client joining fresh gets a snapshot; a client that dropped its socket reconnects with the last sequence it saw and receives exactly the events it missed.
Closing a laptop mid-run costs nothing, which matters for sessions that run for hours.

**The workspace is shared.** Files the agent writes go to a per-session directory and are described to the agent as the group's surface, so results land somewhere everyone can look rather than scrolling away in chat.

## How it fits together

```
browsers ──WebSocket──┐
                      ├── Session ── event log (seq) ──> broadcast to all sockets
browsers ──WebSocket──┘      │
                             ├── messages[]  (the conversation sent to the model)
                             ├── pending[]   (queued while a turn is in flight)
                             └── AgentDriver ── Anthropic streaming API, or the mock
```

The server is authoritative.
Clients never mutate state; they send intents (`say`, `steer`, `interrupt`, `decide`) and render the events that come back.
That is what lets two people act on one running agent without either of them holding a lock.

| Path | What it holds |
| --- | --- |
| `shared/protocol.ts` | Wire types shared by both sides |
| `server/session.ts` | Session state, the agent loop, queueing, interrupts, approvals, event log |
| `server/agent.ts` | The Anthropic streaming driver and the mock that stands in for it |
| `server/tools.ts` | Tools and the per-session workspace, including which ones need approval |
| `web/useSession.ts` | Socket client: snapshot, deltas, reconnect from a cursor |

## Model configuration

Streaming, `claude-opus-5`, adaptive thinking with `display: "summarized"` so spectators can watch the reasoning rather than a spinner, and `effort: "high"`.
The system prompt tells the agent it is in a shared session, that user messages are prefixed with the sender's name, and that it should acknowledge redirects in a sentence rather than re-arguing the previous direction.

## Limits

This is a prototype, and the following are deliberate omissions rather than oversights.

- Sessions live in memory. Restarting the server clears them.
- No authentication. Anyone with the URL is a full participant, including for tool approvals.
- The event log keeps the last 1000 events per session, so a client offline for a very long run resyncs with a snapshot instead of a replay.
- The workspace is guarded against path traversal but is not a sandbox. It is not safe to point at untrusted input as-is.
- One shared driver for all sessions, and no per-session rate limiting.
