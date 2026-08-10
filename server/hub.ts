import { randomBytes } from "node:crypto";
import { Session } from "./session.ts";
import { createDriver, DEFAULT_MODEL, MODELS } from "./agent.ts";
import * as store from "./store.ts";

/** Registry of live sessions. One driver is shared by all of them. */
export class Hub {
  private sessions = new Map<string, Session>();
  private driver = createDriver();

  constructor() {
    // Sessions outlive the process: rehydrate whatever was on disk so a restart
    // is not destructive to a conversation someone is in the middle of.
    const restored = store.loadAll();
    for (const persisted of restored) {
      this.sessions.set(persisted.id, new Session(persisted.id, this.driver, persisted));
    }
    if (restored.length > 0) {
      console.log(`[hub] restored ${restored.length} session(s) from disk`);
    }
  }

  /** Short, pronounceable-ish id that reads fine in a shared URL. */
  private newId(): string {
    return randomBytes(4).toString("hex");
  }

  create(): Session {
    let id = this.newId();
    while (this.sessions.has(id)) id = this.newId();
    const session = new Session(id, this.driver);
    this.sessions.set(id, session);
    return session;
  }

  get(id: string): Session | undefined {
    return this.sessions.get(id);
  }

  /** Sessions are created on first visit, so a shared link always works. */
  getOrCreate(id: string): Session {
    const existing = this.sessions.get(id);
    if (existing) return existing;
    const session = new Session(id, this.driver);
    this.sessions.set(id, session);
    return session;
  }

  list(): Session[] {
    return [...this.sessions.values()].sort((a, b) => b.createdAt - a.createdAt);
  }

  get mock(): boolean {
    return this.driver.mock;
  }

  get models(): string[] {
    return [...MODELS];
  }

  get defaultModel(): string {
    return DEFAULT_MODEL;
  }
}
