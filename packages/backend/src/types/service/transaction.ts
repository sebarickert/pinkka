import type {
  NewTransactionDto,
  UpdateTransactionDto,
} from "@pinkka/schemas/transaction-dto.js";
import { type Transaction as KyselyTransaction } from "kysely";
import type { BaseServiceOptions } from "@/types/db/base-repo-options.js";
import type { Transaction } from "@/types/db/transaction.js";
import type { Database } from "@/types/db/database.js";

export type CreateTransactionServiceParameters = {
  data: NewTransactionDto;
  userId: string;
  trx?: KyselyTransaction<Database>;
} & BaseServiceOptions;

export type UpdateTransactionServiceParameters = {
  data: UpdateTransactionDto;
  transaction: Transaction;
} & BaseServiceOptions;

export type DeleteTransactionServiceParameters = {
  id: string;
  userId: string;
  transaction: Transaction;
} & BaseServiceOptions;
