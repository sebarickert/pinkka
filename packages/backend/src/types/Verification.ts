import type { Timestamp } from "@/types/Database.js";
import type { Generated, Insertable, Selectable, Updateable } from "kysely";

export interface VerificationTable {
  createdAt: Generated<Timestamp>;
  expiresAt: Timestamp;
  id: Generated<string>;
  identifier: string;
  updatedAt: Generated<Timestamp>;
  value: string;
}

export type Verification = Selectable<VerificationTable>;
export type NewVerification = Insertable<VerificationTable>;
export type VerificationUpdate = Updateable<VerificationTable>;
