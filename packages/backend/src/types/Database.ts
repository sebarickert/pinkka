import type { AccountTable } from "@/types/Account.js";
import type { CategoryTable } from "@/types/Category.js";
import type { FinancialAccountTable } from "@/types/FinancialAccount.js";
import type { PgMigrationsTable } from "@/types/PgMigrations.js";
import type { SessionTable } from "@/types/Session.js";
import type { TransactionTable } from "@/types/Transaction.js";
import type { TransactionCategoryTable } from "@/types/TransactionCategory.js";
import type { UserTable } from "@/types/User.js";
import type { VerificationTable } from "@/types/Verification.js";
import type { ColumnType } from "kysely";

// Generic Timestamp type
export type Timestamp = ColumnType<Date, Date | string, Date | string>;

export interface Database {
  financial_account: FinancialAccountTable;
  transaction: TransactionTable;
  user: UserTable;
  verification: VerificationTable;
  session: SessionTable;
  account: AccountTable;
  pgmigrations: PgMigrationsTable;
  category: CategoryTable;
  transaction_category: TransactionCategoryTable;
}
