import type { Insertable, Selectable, Updateable } from "kysely";

export interface TransactionCategoryTable {
  category_id: string;
  transaction_id: string;
}

export type TransactionCategory = Selectable<TransactionCategoryTable>;
export type NewTransactionCategory = Insertable<TransactionCategoryTable>;
