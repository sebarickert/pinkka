import type { Timestamp } from "@/types/Database.js";
import type { Generated, Insertable, Selectable, Updateable } from "kysely";

export interface UserTable {
  created_at: Generated<Timestamp>;
  email: string;
  email_verified: boolean;
  id: Generated<string>;
  image: string | null;
  name: string;
  updated_at: Generated<Timestamp>;
}

export type User = Selectable<UserTable>;
export type NewUser = Insertable<UserTable>;
export type UserUpdate = Updateable<UserTable>;
