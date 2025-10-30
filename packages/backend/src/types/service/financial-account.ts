import { type Transaction as KyselyTransaction } from "kysely";
import type { NewFinancialAccountDto } from "@pinkka/schemas/financial-account-dto.js";
import type { BaseServiceOptions } from "@/types/db/base-repo-options.js";
import type { Transaction } from "@/types/db/transaction1.js";
import type { Database } from "@/types/db/database1.js";

export type CreateFinancialAccountServiceParameters = {
  data: NewFinancialAccountDto;
  userId: string;
  trx?: KyselyTransaction<Database>;
} & BaseServiceOptions;

export type DeleteFinancialAccountServiceParameters = {
  id: string;
  userId: string;
  trx?: KyselyTransaction<Database>;
} & BaseServiceOptions;

export type UpdateAccountBalancesForTransactionServiceParameters = {
  transaction: Transaction;
  amount: number;
  trx?: KyselyTransaction<Database>;
} & BaseServiceOptions;
