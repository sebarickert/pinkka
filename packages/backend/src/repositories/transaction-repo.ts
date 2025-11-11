import { db } from "@/lib/db.js";
import type { Transaction, TransactionDetail } from "@/types/db/transaction.js";
import type {
  FindOneTransactionRepoParameters,
  UpdateTransactionRepoParameters,
  DeleteTransactionRepoParameters,
  CreateTransactionRepoParameters,
  GetAllTransactionRepoParameters,
  FindDetailsTransactionRepoParameters,
} from "@/types/repo/transaction.js";
import type { Expression, SqlBool } from "kysely";

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
  async findDetails(
    parameters: FindDetailsTransactionRepoParameters
  ): Promise<TransactionDetail | undefined> {
    return (parameters.trx ?? db)
      .selectFrom("transaction")
      .leftJoin(
        "financial_account as from",
        "from.id",
        "transaction.from_account_id"
      )
      .leftJoin("financial_account as to", "to.id", "transaction.to_account_id")
      .selectAll("transaction")
      .select(["from.name as from_account_name", "to.name as to_account_name"])
      .where("transaction.id", "=", parameters.id)
      .where("transaction.user_id", "=", parameters.userId)
      .executeTakeFirst();
  },
  async getAll(
    parameters: GetAllTransactionRepoParameters
  ): Promise<Transaction[]> {
    let query = (parameters.trx ?? db)
      .selectFrom("transaction")
      .selectAll()
      .where("user_id", "=", parameters.userId)
      .where((eb) => {
        const filters: Expression<SqlBool>[] = [];

        if (parameters.accountId) {
          const accountId = parameters.accountId;

          filters.push(
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

          filters.push(
            eb.and([eb("date", ">=", startDate), eb("date", "<", endDate)])
          );
        }

        if (!parameters.month && parameters.year) {
          const startDate = new Date(parameters.year, 0, 1);
          const endDate = new Date(parameters.year + 1, 0, 1);

          filters.push(
            eb.and([eb("date", ">=", startDate), eb("date", "<", endDate)])
          );
        }

        return eb.and(filters);
      })
      .orderBy("date", "desc");

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
