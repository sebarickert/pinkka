import type { Timestamp } from "@/types/Database.js";
import type { Generated, Insertable, Selectable, Updateable } from "kysely";

export interface VerificationTable {
  created_at: Generated<Timestamp>;
  expires_at: Timestamp;
  id: Generated<string>;
  identifier: string;
  updated_at: Generated<Timestamp>;
  value: string;
}

export type Verification = Selectable<VerificationTable>;
export type NewVerification = Insertable<VerificationTable>;
export type VerificationUpdate = Updateable<VerificationTable>;
