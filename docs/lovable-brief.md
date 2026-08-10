# Lovable brief: multiplayer-agent frontend

Paste the section under **Prompt for Lovable** into Lovable.
Everything before and after it is context for you, not for Lovable.

## How this fits together

Lovable builds the **presentational shell only**: screens, components, layout, styling.
It must not build any networking.

The networking already exists and is not being regenerated.
`web/useSession.ts` holds the WebSocket client, the snapshot-and-delta projection, and the reconnect-from-a-cursor logic.
Both of the real bugs found in this project were in that file, and reinventing it would mean rediscovering them.

So the integration is: Lovable produces components that take props and call callbacks, and we wire our existing hook into them.

## What to do with the result

1. Run the prompt in Lovable and let it generate the project.
2. Connect it to GitHub and push, or export the code.
3. Hand it back here. Integration is mechanical: copy the components in, import `useSession`, and pass its values as props.

Keep the generated project as **Vite + React + TypeScript**.
Do not accept the Supabase integration Lovable will offer; there is no database and no backend for it to connect to.

---

## Prompt for Lovable

> Build the frontend for a **multiplayer AI agent session** app: one AI agent that several people watch and direct at the same time, like a Google Doc but the thing being edited is a running agent.
>
> **Critical constraints**
>
> - Vite + React + TypeScript. No Next.js.
> - **Do not add any backend, database, Supabase, auth provider, or data fetching.** No `fetch`, no WebSocket, no API client. Every component receives data through props and reports actions through callbacks. I am wiring this to an existing WebSocket layer myself.
> - Define the TypeScript types exactly as given below and use them as the component prop types.
> - Dark theme. Dense and calm, closer to Linear or a code editor than to a consumer chat app. It should look like a tool a team leaves open all day.
>
> **The types** (use verbatim)
>
> ```ts
> type Role = "participant" | "observer";
>
> interface Participant {
>   id: string;
>   name: string;
>   color: number;        // 0-7, index into an 8-colour palette
>   role: Role;
>   joinedAt: number;
>   online: boolean;
> }
>
> interface RunState {
>   status: "idle" | "running" | "awaiting-approval";
>   startedBy?: Participant;
>   queued: number;       // messages waiting for the agent to finish
> }
>
> interface SessionConfig {
>   model: string;
>   systemPromptExtra: string;
>   webSearch: boolean;
> }
>
> interface WorkspaceFile { path: string; size: number; modifiedAt: number }
>
> type Entry =
>   | { kind: "user"; id: string; at: number; author: Participant; text: string; queued: boolean }
>   | { kind: "agent"; id: string; at: number; text: string; thinking: string;
>       status: "streaming" | "done" | "interrupted" | "error";
>       interruptedBy?: Participant; error?: string; model?: string }
>   | { kind: "tool"; id: string; at: number; name: string; input: unknown;
>       status: "pending-approval" | "running" | "ok" | "error" | "denied";
>       output?: string; decidedBy?: Participant }
>   | { kind: "system"; id: string; at: number; text: string };
> ```
>
> **Screens**
>
> 1. **Lobby** — product name, one-line pitch, a "Start a session" button, and a list of sessions. Each row: title, entry count, when it started, overlapping avatars of who is inside, and a status pill. Props: `sessions`, `onCreate`.
>
> 2. **Join screen** — shown before entering a session. Shows the session title and avatars of who is already inside. A name field, a row of eight colour swatches, and a two-card choice between **Participant** ("Send messages, interrupt the agent, approve its tool calls") and **Observer** ("Watch it work live without being able to act"). A "Join session" button. Props: `sessionTitle`, `peopleInside`, `initial`, `onJoin(name, color, role)`.
>
> 3. **Room** — the main screen. A top bar, a scrolling transcript, an optional right-hand panel, and a composer pinned to the bottom.
>
> **Room details**
>
> *Top bar:* product name, session title, a status pill reading idle / running / needs approval, a model button, a "Files · N" button, your own name button, overlapping avatars of everyone present with a "3 here · 1 watching" label, and a "Copy link" button.
>
> *Transcript:* render each `Entry` by `kind`.
> - `user` — avatar in the person's colour, their name in that colour, timestamp, message. When `queued` is true, dim it and add a "queued" chip.
> - `agent` — a distinct agent avatar. If `thinking` is non-empty, a collapsible "Show reasoning" disclosure above the text, dimmed and monospace-free. While `status` is `"streaming"`, show a blinking caret after the text. When `interrupted`, show a "stopped by <name>" chip.
> - `tool` — a bordered card: monospace tool name, a status label, the `input` as pretty-printed JSON, and `output` when present. When `status` is `"pending-approval"`, highlight the card and show **Approve** and **Deny** buttons with the line "Anyone here can decide." When decided, show a small footer with the decider's avatar and "approved by <name>".
> - `system` — small centred grey text.
>
> *Composer:* a growing textarea. When `run.status` is not idle, show a banner above it with a pulsing dot, text like "Agent is working on Ada's request · 2 messages queued", and a **Stop** button; the send button becomes **Queue** and a **Steer** button appears next to it. When the viewer is an observer, replace the whole composer with a bar reading "You're observing. You can watch the agent work, but not send, interrupt, or approve." plus a "Join in" button.
>
> *Files panel:* a right-hand panel that pushes the transcript over rather than covering it. Lists `WorkspaceFile`s with name and human-readable size; clicking one opens a monospace viewer below with a Download link.
>
> *Settings popover:* anchored under the model button. A model dropdown, a "Web search" checkbox, and a "Session instructions" textarea with a save button. When settings are locked, show an amber note at the top and disable every control.
>
> Build all of it with realistic mock data defined in the components' stories or a demo page, so I can see every state: idle, streaming, awaiting approval, interrupted, observer, and a session with several people in it.

---

## After Lovable

Map its components onto our data:

| Lovable component | Wire to |
| --- | --- |
| Lobby | `api.listSessions()` / `api.createSession()` |
| Join screen | `Room.tsx`'s `JoinGate` slot, `saveIdentity` |
| Transcript | `session.entries`, `onDecide` → `send({t:"decide"})` |
| Composer | `session.run`, `send({t:"say" \| "steer" \| "interrupt"})` |
| Files panel | `session.files`, `api.readFile`, `api.fileDownloadUrl` |
| Settings | `session.config`, `session.models`, `send({t:"setConfig"})` |

Do not port Lovable's state management for anything above; `useSession` is the source of truth.
