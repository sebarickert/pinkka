import type { Timestamp } from "@/types/Database.js";
import type { Generated, Insertable, Selectable, Updateable } from "kysely";

export interface TransactionTable {
  id: Generated<string>;
  user_id: string;
  to_account_id: string | null;
  from_account_id: string | null;
  type: "income" | "expense" | "transfer";
  amount: number;
  description: string;
  date: Timestamp;
  created_at: Generated<Timestamp>;
  updated_at: Generated<Timestamp>;
}

export type Transaction = Selectable<TransactionTable>;
export type NewTransaction = Insertable<TransactionTable>;
export type TransactionUpdate = Updateable<TransactionTable>;
