import type { BaseRepoOptions } from "@/types/db/base-repo-options.js";
import type {
  NewTransaction,
  TransactionUpdate,
} from "@/types/db/transaction.js";

export type CreateTransactionRepoParameters = {
  data: NewTransaction;
} & BaseRepoOptions;

export type FindOneTransactionRepoParameters = {
  id: string;
  userId: string;
} & BaseRepoOptions;

export type GetAllTransactionRepoParameters = {
  userId: string;
  accountId?: string;
} & BaseRepoOptions;

export type UpdateTransactionRepoParameters = {
  id: string;
  userId: string;
  data: TransactionUpdate;
} & BaseRepoOptions;

export type DeleteTransactionRepoParameters = {
  id: string;
  userId: string;
} & BaseRepoOptions;
