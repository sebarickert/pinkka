import type { ColumnType } from "kysely";
import type { AccountTable } from "@/types/db/account1.js";
import type { CategoryTable } from "@/types/db/category1.js";
import type { FinancialAccountTable } from "@/types/db/financial-account.js";
import type { PgMigrationsTable } from "@/types/db/pg-migrations.js";
import type { SessionTable } from "@/types/db/session1.js";
import type { TransactionTable } from "@/types/db/transaction1.js";
import type { TransactionCategoryTable } from "@/types/db/transaction-category1.js";
import type { UserTable } from "@/types/db/user1.js";
import type { VerificationTable } from "@/types/db/verification1.js";

// Generic Timestamp type
export type Timestamp = ColumnType<Date, Date, Date>;

export type Database = {
  financial_account: FinancialAccountTable;
  transaction: TransactionTable;
  user: UserTable;
  verification: VerificationTable;
  session: SessionTable;
  account: AccountTable;
  pgmigrations: PgMigrationsTable;
  category: CategoryTable;
  transaction_category: TransactionCategoryTable;
};
