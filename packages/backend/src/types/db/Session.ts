import type { Generated, Insertable, Selectable, Updateable } from "kysely";
import type { Timestamp } from "@/types/db/database.js";

export type SessionTable = {
  created_at: Generated<Date>;
  expires_at: Timestamp;
  id: Generated<string>;
  ip_address: string | null;
  token: string;
  updated_at: Generated<Date>;
  user_agent: string | null;
  user_id: string;
  impersonated_by?: string | null;
};

export type Session = Selectable<SessionTable>;
export type NewSession = Insertable<SessionTable>;
export type SessionUpdate = Updateable<SessionTable>;
