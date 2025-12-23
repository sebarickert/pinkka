import { db } from "@/lib/db.js";
import type { TransactionCategory } from "@/types/db/transaction-category.js";
import type {
  CreateTransactionCategoryParameters,
  DeleteTransactionCategoryParameters,
  UpsertTransactionCategoryParameters,
} from "@/types/repo/transaction-category.js";

export const TransactionCategoryRepo = {
  async create(
    parameters: CreateTransactionCategoryParameters
  ): Promise<TransactionCategory> {
    return (parameters.trx ?? db)
      .insertInto("transaction_category")
      .values(parameters.data)
      .returningAll()
      .executeTakeFirstOrThrow();
  },
  async upsert(
    parameters: UpsertTransactionCategoryParameters
  ): Promise<TransactionCategory> {
    await (parameters.trx ?? db)
      .deleteFrom("transaction_category")
      .where("transaction_id", "=", parameters.data.transaction_id)
      .execute();

    return (parameters.trx ?? db)
      .insertInto("transaction_category")
      .values(parameters.data)
      .returningAll()
      .executeTakeFirstOrThrow();
  },
  async delete(parameters: DeleteTransactionCategoryParameters) {
    return (parameters.trx ?? db)
      .deleteFrom("transaction_category")
      .where("transaction_id", "=", parameters.transaction_id)
      .execute();
  },
};
