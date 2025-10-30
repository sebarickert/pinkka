import { db } from "@/lib/db.js";
import type { Transaction } from "@/types/db/transaction.js";
import type {
  FindOneTransactionRepoParameters,
  UpdateTransactionRepoParameters,
  DeleteTransactionRepoParameters,
  CreateTransactionRepoParameters,
  GetAllTransactionRepoParameters,
} from "@/types/repo/transaction.js";

export const TransactionRepo = {
  async create(
    parameters: CreateTransactionRepoParameters
  ): Promise<Transaction> {
    return (parameters.trx ?? db)
      .insertInto("transaction")
      .values(parameters.data)
      .returningAll()
      .executeTakeFirstOrThrow();
  },
  async findOne(
    parameters: FindOneTransactionRepoParameters
  ): Promise<Transaction | undefined> {
    return (parameters.trx ?? db)
      .selectFrom("transaction")
      .where("id", "=", parameters.id)
      .where("user_id", "=", parameters.userId)
      .selectAll()
      .executeTakeFirst();
  },
  async getAll(
    parameters: GetAllTransactionRepoParameters
  ): Promise<Transaction[]> {
    return (parameters.trx ?? db)
      .selectFrom("transaction")
      .where("user_id", "=", parameters.userId)
      .selectAll()
      .execute();
  },
  async update(
    parameters: UpdateTransactionRepoParameters
  ): Promise<Transaction> {
    return (parameters.trx ?? db)
      .updateTable("transaction")
      .where("id", "=", parameters.id)
      .where("user_id", "=", parameters.userId)
      .set(parameters.data)
      .returningAll()
      .executeTakeFirstOrThrow();
  },
  async delete(parameters: DeleteTransactionRepoParameters) {
    return (parameters.trx ?? db)
      .deleteFrom("transaction")
      .where("id", "=", parameters.id)
      .where("user_id", "=", parameters.userId)
      .execute();
  },
};
