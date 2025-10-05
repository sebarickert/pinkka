import type { Timestamp } from "@/types/Database.js";
import type { Generated, Insertable, Selectable, Updateable } from "kysely";

export interface SessionTable {
  created_at: Generated<Timestamp>;
  expires_at: Timestamp;
  id: Generated<string>;
  ip_address: string | null;
  token: string;
  updated_at: Generated<Timestamp>;
  user_agent: string | null;
  user_id: string;
}

export type Session = Selectable<SessionTable>;
export type NewSession = Insertable<SessionTable>;
export type SessionUpdate = Updateable<SessionTable>;
