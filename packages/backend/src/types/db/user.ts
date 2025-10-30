import type {
  Generated,
  GeneratedAlways,
  Insertable,
  Selectable,
  Updateable,
} from "kysely";

export type UserTable = {
  created_at: Generated<Date>;
  email: string;
  email_verified: boolean;
  id: GeneratedAlways<string>;
  image: string | null;
  name: string;
  updated_at: Generated<Date>;
  role?: string;
  banned?: boolean;
  ban_reason?: string | null;
  ban_expires?: Date | null;
};

export type User = Selectable<UserTable>;
export type NewUser = Insertable<UserTable>;
export type UserUpdate = Updateable<UserTable>;
