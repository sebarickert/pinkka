import type { Timestamp } from "@/types/Database.js";
import type { Generated, Insertable, Selectable, Updateable } from "kysely";

export interface AccountTable {
  accessToken: string | null;
  accessTokenExpiresAt: Timestamp | null;
  accountId: string;
  createdAt: Generated<Timestamp>;
  id: Generated<string>;
  idToken: string | null;
  password: string | null;
  providerId: string;
  refreshToken: string | null;
  refreshTokenExpiresAt: Timestamp | null;
  scope: string | null;
  updatedAt: Generated<Timestamp>;
  userId: string;
}

export type Account = Selectable<AccountTable>;
export type NewAccount = Insertable<AccountTable>;
export type AccountUpdate = Updateable<AccountTable>;
