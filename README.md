# multiplayergpt

**An AI chat your whole team can be in at once.**

Normal AI chat is single-player. You open a tab, type a prompt, get an answer, and the only way to
share it is a screenshot or a dead transcript nobody can touch.

multiplayergpt puts the conversation in a room instead. Open a session, send the link, and anyone who
opens it is in the same live chat: watching the assistant type, adding to the conversation, stopping
it when it goes the wrong way, and deciding together when it wants to write a file.

<!-- Add a screenshot or short clip here once you have one. -->

## What you can do in a session

- **See it think in real time.** Everyone watches the same reply stream in, word by word, with an
  optional look at the assistant's reasoning.
- **Talk over each other safely.** Send a message while the assistant is still working and it queues
  up instead of being lost or starting a second conversation. Everyone sees it waiting.
- **Stop it.** Anyone can hit Stop. Whatever it had written so far is kept, and the chat records who
  stopped it.
- **Change direction mid-answer.** Steer stops the assistant and redirects it in one action, instead
  of making you stop, wait, then retype.
- **Approve tools together.** When the assistant wants to write a file, it pauses and asks the room.
  Anyone can approve or deny, and the chat shows who decided.
- **Share the files it makes.** Everything it writes lands in a Files panel the whole session can
  read and download.
- **Join late.** Open the link an hour in and you get the entire history, then the live stream.
- **Close your laptop.** Reconnecting picks up exactly where you left off.

## Getting started

You need [Node.js](https://nodejs.org) 22 or newer.

```bash
npm install
npm run dev
```

Open the URL it prints (usually http://localhost:5173). You'll be asked for a name and a colour, and
whether you're joining as a **participant** (can act) or an **observer** (watch only).

That's it - it runs immediately with a built-in demo assistant, so you can try the multiplayer parts
without signing up for anything.

### Connecting a real model

The demo assistant is scripted. For real answers, add an
[Anthropic API key](https://console.anthropic.com/settings/keys) to a file called `.env` in the
project folder:

```
ANTHROPIC_API_KEY=sk-ant-...
```

Then restart (`Ctrl+C`, `npm run dev` again). On startup it prints which one it's using:

```
[agent] Using the Anthropic API (default model claude-opus-5).
```

`.env` is git-ignored, and the key stays on the server - it is never sent to anyone's browser.

### Trying it with two people from one computer

Every browser tab shares one saved identity, so a second tab looks like the same person. Add `?as=`
to pretend to be someone else:

```
http://localhost:5173/?as=Sam#/s/<session-id>
```

## Inviting people

`npm run dev` runs two servers for fast reloading, which doesn't work over the internet. To share it,
build once and run the single-port version:

```bash
npm run build
npm start
```

Now everything is served from one address (port 8787 by default).

**Same office or Wi-Fi:** send them `http://<your-computer's-IP>:8787`.

**Anywhere else:** put a tunnel in front of it. With
[cloudflared](https://developers.cloudflare.com/cloudflare-tunnel/) installed:

```bash
cloudflared tunnel --url http://localhost:8787
```

It prints a public `https://...trycloudflare.com` link that works from anywhere. Press `Ctrl+C` to
take it down; the link dies with it.

> **Before you share a link publicly, set a password.** Add `ACCESS_CODE=some-secret` to `.env` and
> restart. Without one, anyone with the link can use your API key and approve the assistant's file
> writes. Files it writes go to `workspace/<session-id>/` inside the project folder.

## Settings inside a session

Click the model name in the top bar:

- **Model** - swap between models mid-session. Only allowed while the assistant is idle, because
  switching throws away the cached conversation and makes the next reply more expensive. Everyone
  sees who changed it.
- **Web search** - let it look things up. Charged per search.
- **Session instructions** - extra guidance for this room only, editable by anyone in it.

## Good to know

- **Sessions are saved.** They survive restarting the server. Old sessions are listed on the home
  screen.
- **Observer is a courtesy, not a lock.** Anyone can switch themselves to participant. If you need
  real control over who can act, use `ACCESS_CODE` - that's the only actual gate.
- **It's a single server.** Fine for a team; not built for thousands of concurrent rooms.
- **Housekeeping:** `npm run clean:workspace` deletes all saved sessions and files.

## Commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Development, with live reloading |
| `npm run build` | Build the shareable version |
| `npm start` | Run the built version on one port |
| `npm test` | Run the test suite (no API key needed) |
| `npm run clean:workspace` | Delete saved sessions and files |

## How it works

The server holds the truth. Browsers don't edit anything directly - they send intents (`say`,
`steer`, `interrupt`, `decide`) and render the events that come back. That's what lets two people act
on the same running assistant without either of them holding a lock.

Every change is an event with a sequence number. A new tab gets a snapshot; a reconnecting tab says
"I last saw event 412" and receives only what it missed.

```
browsers ──WebSocket──┐
                      ├── Session ── event log ──> broadcast to everyone
browsers ──WebSocket──┘      │
                             ├── conversation sent to the model
                             ├── messages queued mid-turn
                             └── model API, or the built-in demo assistant
```

| Path | Contents |
| --- | --- |
| `shared/protocol.ts` | Message types shared by server and browser |
| `server/session.ts` | Session state, presence, queueing, approvals, event log |
| `server/turn.ts` | One assistant turn: streaming, tools, interrupts |
| `server/agent.ts` | Model client, and the demo assistant used without a key |
| `server/store.ts` | Saving sessions to disk |
| `server/workspace.ts` | Per-session files, and the path checks that keep them contained |
| `web/useSession.ts` | Browser side: snapshot, live updates, reconnect |
| `web/Markdown.tsx` | Renders replies without ever injecting HTML |

Built with TypeScript, React and Vite. No database, no framework beyond that.

## Licence

MIT. See [LICENSE](LICENSE).
