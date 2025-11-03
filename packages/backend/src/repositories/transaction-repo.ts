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
    let query = (parameters.trx ?? db)
      .selectFrom("transaction")
      .selectAll()
      .where("user_id", "=", parameters.userId);

    if (parameters.accountId) {
      const accountId = parameters.accountId;
      query = query.where((eb) =>
        eb.or([
          eb("to_account_id", "=", accountId),
          eb("from_account_id", "=", accountId),
        ])
      );
    }

    if (parameters.month && parameters.year) {
      const startDate = new Date(parameters.year, parameters.month - 1, 1);
      const endDate = new Date(
        parameters.month === 12 ? parameters.year + 1 : parameters.year,
        parameters.month === 12 ? 0 : parameters.month,
        1
      );

      query = query.where("date", ">=", startDate).where("date", "<", endDate);
    }

    query = query.orderBy("date", "desc");

    if (parameters.limit) {
      query = query.limit(parameters.limit);
    }

    return query.execute();
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
