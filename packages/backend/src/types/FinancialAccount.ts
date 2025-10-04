import type { Timestamp } from "@/types/Database.js";
import type { Generated, Insertable, Selectable, Updateable } from "kysely";

export interface FinancialAccountTable {
  id: Generated<string>;
  user_id: string;
  name: string;
  type: "bank" | "credit_card" | "wallet" | "investment" | "loan";
  currency: string;
  current_balance: number;
  pending_balance: number;
  is_deleted: boolean;
  created_at: Generated<Timestamp>;
  updated_at: Generated<Timestamp>;
}

export type FinancialAccount = Selectable<FinancialAccountTable>;
export type NewFinancialAccount = Insertable<FinancialAccountTable>;
export type FinancialAccountUpdate = Updateable<FinancialAccountTable>;
