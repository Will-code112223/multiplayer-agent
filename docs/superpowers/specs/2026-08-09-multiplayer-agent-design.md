# multiplayer-agent: features, auth, persistence, frontend

Date: 2026-08-09
Status: approved, in implementation

## Context

The prototype works but is thin: sessions die on restart, everyone is anonymous with an auto-assigned name, the agent's files are buried inside tool cards, and the model is a module constant.
This spec covers the work to close those gaps, plus publishing the project and a design pass on the frontend.

## Decisions

| Question | Decision |
| --- | --- |
| Persistence | Yes. Sessions survive restart. |
| Auth | Yes. Optional shared access code, off unless `ACCESS_CODE` is set. |
| Model switching | Allowed only while the agent is idle, and the cache cost is surfaced in the UI and the transcript. |
| Frontend | Built and designed in-repo. A Lovable handoff was specced and then dropped: the frontend already existed, and splitting it across a generator would have meant reintegrating the one part worth keeping. |
| Repo | Public, `multiplayer-agent`. |

## Non-goals

- Accounts, per-user identity, or authorization beyond one shared code.
  Roles are a UX affordance, not a security boundary: any participant can switch their own role.
  The access code is the only real gate, and it is all-or-nothing.
- A database. Persistence is JSON files on disk, which is enough for a prototype and keeps the dependency count at zero.
- Multi-server deployment. State is in one process; the files exist so a restart is not destructive.

## Phase 1: publish

`git init`, verify `.env` and `workspace/` are excluded, initial commit, MIT licence, then `gh repo create multiplayer-agent --public --source=. --push`.
The user runs `gh auth login`; it involves their credentials and is not something the agent should do.

## Phase 2: features

### 2.1 Persistence

`server/store.ts` owns a `data/sessions/<id>.json` file per session.

Persisted: `id`, `title`, `createdAt`, `entries`, `messages` (the model conversation), `config`, and the participant roster (name, colour, role) so returning people keep their identity.
Not persisted: sockets, the event log, the pending queue, and run state.

On load, every participant is marked offline, run state resets to idle, and any entry still marked `streaming` is rewritten to `interrupted` since no run survived the restart.
Writes are debounced 500ms and flushed on `SIGINT`/`SIGTERM`.

The event log resets on boot, so a reconnecting client's cursor is ahead of the server's.
That case already falls back to a snapshot, so no protocol change is needed.

### 2.2 Auth

`ACCESS_CODE` in the environment. When unset the app is open, exactly as today.

When set, `GET /api/config` reports `authRequired: true` without revealing the code, every other `/api/*` route requires an `x-access-code` header, and the WebSocket `hello` frame must carry a matching `code` or the socket is closed with 4001.
Comparison is constant-time.
The client shows a code screen, stores the value in `localStorage`, and retries.

### 2.3 Identity and roles

`Participant` gains `role: "participant" | "observer"`.

A join screen sits in front of every room: session title, who is already inside (from `GET /api/sessions/:id`, so no protocol change), a name field, eight colour swatches, and the role choice.
Returning visitors skip it, with a "not you?" link to reset.

Observers receive the full live stream but their `say`, `steer`, `interrupt`, and `decide` intents are dropped server-side and answered with a `denied` event.
The composer is replaced with an observing bar and a button to switch role.

### 2.4 Shared workspace panel

`server/workspace.ts` holds the one path-resolution guard, used by both the tools and the new endpoints, so the traversal check exists in exactly one place.

- `GET /api/sessions/:id/files` lists `{path, size, modifiedAt}`.
- `GET /api/sessions/:id/files/<path>` returns the contents.

A `files` server event fires when a write completes, so the panel updates live rather than polling.

### 2.5 Agent capability

`SessionConfig { model, systemPromptExtra, webSearch }`, per session.

`Hub` currently holds one driver and `MODEL` is a module constant, so model choice moves into a per-request parameter: `runTurn` takes `{messages, model, system, tools}`.
The Anthropic client is stateless per request, so one instance still serves every session.

`setConfig` is rejected unless the session is idle.
The model must be in an allowlist (`claude-opus-5`, `claude-sonnet-5`, `claude-haiku-4-5`).
Switching writes a system entry to the transcript naming who changed it and noting the prompt cache reset.

The `web_search` tool version depends on the model: `web_search_20260209` on Opus 5 and Sonnet 5, and the older `web_search_20250305` on Haiku 4.5, which does not support the newer variant.

### 2.6 Targeted refactor

`server/session.ts` is 540 lines and every feature above lands in it.
The agent loop (`runTurn`, `executeTools`, approval waiting) moves to `server/turn.ts`, leaving session state, presence, and the event log behind.
Nothing else is restructured.

## Phase 3: frontend design pass

The frontend was already hand-written and working, so this is a design pass rather than a rebuild.

The largest gap was that agent output rendered as raw text: headings, bold, lists, tables and code fences all showed their markup literally, which made a working product read like a debug view.

`web/Markdown.tsx` renders the subset language models actually emit.
It builds React elements directly and never uses `dangerouslySetInnerHTML`, because the input is untrusted text arriving over a socket; the safest parser is one with no HTML path at all.
Link hrefs are restricted to `http`, `https` and `mailto`, so a `javascript:` URL in model output cannot become clickable.
It also has to survive rendering a half-finished document, since it runs mid-stream.

Tool cards collapse to a single summary line once settled, with the raw JSON behind a disclosure.
A 2KB file body inlined in the transcript buried the conversation it was part of.

## Testing

Each feature gets a credential-free test against the mock driver, in the style of the existing `test/session-replay.mjs`:

- `test/roles.mjs`: observer intents are rejected, role switching works.
- `test/workspace-api.mjs`: listing is correct, traversal is blocked.
- `test/persistence.mjs`: a session survives a simulated restart with its transcript intact.
- `test/config.mjs`: model allowlist enforced, `setConfig` refused while running.

## Known limitations

- Roles are not enforced against a determined user; only the access code is.
- One process, so no horizontal scaling.
- `data/` and `workspace/` grow without bound. `npm run clean:workspace` removes both.
