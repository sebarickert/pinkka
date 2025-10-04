import type { Timestamp } from "@/types/Database.js";
import type { Generated, Insertable, Selectable, Updateable } from "kysely";

export interface SessionTable {
  createdAt: Generated<Timestamp>;
  expiresAt: Timestamp;
  id: Generated<string>;
  ipAddress: string | null;
  token: string;
  updatedAt: Generated<Timestamp>;
  userAgent: string | null;
  userId: string;
}

export type Session = Selectable<SessionTable>;
export type NewSession = Insertable<SessionTable>;
export type SessionUpdate = Updateable<SessionTable>;
