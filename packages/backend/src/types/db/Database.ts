import type { ColumnType } from "kysely";
import type { AccountTable } from "@/types/db/account.js";
import type { CategoryTable } from "@/types/db/category.js";
import type { FinancialAccountTable } from "@/types/db/financial-account.js";
import type { PgMigrationsTable } from "@/types/db/pg-migrations.js";
import type { SessionTable } from "@/types/db/session.js";
import type { TransactionTable } from "@/types/db/transaction.js";
import type { TransactionCategoryTable } from "@/types/db/transaction-category.js";
import type { UserTable } from "@/types/db/user.js";
import type { VerificationTable } from "@/types/db/verification.js";

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
