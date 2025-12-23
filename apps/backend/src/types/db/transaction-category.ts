import type { Insertable, Selectable } from "kysely";

export type TransactionCategoryTable = {
  category_id: string;
  transaction_id: string;
};

export type TransactionCategory = Selectable<TransactionCategoryTable>;
export type NewTransactionCategory = Insertable<TransactionCategoryTable>;
