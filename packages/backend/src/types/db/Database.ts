import type { AccountTable } from "@/types/db/Account.js";
import type { CategoryTable } from "@/types/db/Category.js";
import type { FinancialAccountTable } from "@/types/db/FinancialAccount.js";
import type { PgMigrationsTable } from "@/types/db/PgMigrations.js";
import type { SessionTable } from "@/types/db/Session.js";
import type { TransactionTable } from "@/types/db/Transaction.js";
import type { TransactionCategoryTable } from "@/types/db/TransactionCategory.js";
import type { UserTable } from "@/types/db/User.js";
import type { VerificationTable } from "@/types/db/Verification.js";
import type { ColumnType } from "kysely";

// Generic Timestamp type
export type Timestamp = ColumnType<Date, Date, Date>;

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
