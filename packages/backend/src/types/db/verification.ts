import type {
  Generated,
  GeneratedAlways,
  Insertable,
  Selectable,
  Updateable,
} from "kysely";
import type { Timestamp } from "@/types/db/database.js";

export type VerificationTable = {
  created_at: Generated<Date>;
  expires_at: Timestamp;
  id: GeneratedAlways<string>;
  identifier: string;
  updated_at: Generated<Date>;
  value: string;
};

export type Verification = Selectable<VerificationTable>;
export type NewVerification = Insertable<VerificationTable>;
export type VerificationUpdate = Updateable<VerificationTable>;
