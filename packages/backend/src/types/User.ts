import type { Timestamp } from "@/types/Database.js";
import type { Generated, Insertable, Selectable, Updateable } from "kysely";

export interface UserTable {
  createdAt: Generated<Timestamp>;
  email: string;
  emailVerified: boolean;
  id: Generated<string>;
  image: string | null;
  name: string;
  updatedAt: Generated<Timestamp>;
}

export type User = Selectable<UserTable>;
export type NewUser = Insertable<UserTable>;
export type UserUpdate = Updateable<UserTable>;
