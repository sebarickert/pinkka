import type { Timestamp } from "@/types/Database.js";
import type { Generated, Insertable, Selectable, Updateable } from "kysely";

export interface AccountTable {
  access_token: string | null;
  access_token_expires_at: Timestamp | null;
  account_id: string;
  created_at: Generated<Timestamp>;
  id: Generated<string>;
  id_token: string | null;
  password: string | null;
  provider_id: string;
  refresh_token: string | null;
  refresh_token_expires_at: Timestamp | null;
  scope: string | null;
  updated_at: Generated<Timestamp>;
  user_id: string;
}

export type Account = Selectable<AccountTable>;
export type NewAccount = Insertable<AccountTable>;
export type AccountUpdate = Updateable<AccountTable>;
