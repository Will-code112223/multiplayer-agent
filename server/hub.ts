import { randomBytes } from "node:crypto";
import { Session } from "./session.ts";
import { createDriver } from "./agent.ts";

/** Registry of live sessions. One driver is shared by all of them. */
export class Hub {
  private sessions = new Map<string, Session>();
  private driver = createDriver();

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

  get model(): string {
    return this.driver.model;
  }
}
