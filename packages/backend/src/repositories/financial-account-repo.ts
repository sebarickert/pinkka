import { db } from "@/lib/db.js";
import type { FinancialAccount } from "@/types/db/financial-account.js";
import type {
  CreateFinancialAccountRepoParameters,
  FindOneFinancialAccountRepoParameters,
  UpdateFinancialAccountRepoParameters,
  GetAllFinancialAccountRepoParameters,
  DeleteFinancialAccountRepoParameters,
  FindTransactionsFinancialAccountRepoParameters,
  IncrementBalanceRepoParameters,
  DecrementBalanceRepoParameters,
} from "@/types/repo/financial-account.js";

export const FinancialAccountRepo = {
  async create(
    parameters: CreateFinancialAccountRepoParameters,
  ): Promise<FinancialAccount> {
    return (parameters.trx ?? db)
      .insertInto("financial_account")
      .values(parameters.data)
      .returningAll()
      .executeTakeFirstOrThrow();
  },
  async findOne(
    parameters: FindOneFinancialAccountRepoParameters,
  ): Promise<FinancialAccount | undefined> {
    return (parameters.trx ?? db)
      .selectFrom("financial_account")
      .where("id", "=", parameters.id)
      .where("user_id", "=", parameters.userId)
      .selectAll()
      .executeTakeFirst();
  },
  async getAll(
    parameters: GetAllFinancialAccountRepoParameters,
  ): Promise<FinancialAccount[]> {
    return (parameters.trx ?? db)
      .selectFrom("financial_account")
      .where("user_id", "=", parameters.userId)
      .where("is_deleted", "=", false)
      .selectAll()
      .execute();
  },
  async update(
    parameters: UpdateFinancialAccountRepoParameters,
  ): Promise<FinancialAccount> {
    return (parameters.trx ?? db)
      .updateTable("financial_account")
      .where("id", "=", parameters.id)
      .where("user_id", "=", parameters.userId)
      .set(parameters.data)
      .returningAll()
      .executeTakeFirstOrThrow();
  },
  async delete(
    parameters: DeleteFinancialAccountRepoParameters,
  ): Promise<FinancialAccount> {
    return (parameters.trx ?? db)
      .updateTable("financial_account")
      .where("id", "=", parameters.id)
      .where("user_id", "=", parameters.userId)
      .set({ is_deleted: true })
      .returningAll()
      .executeTakeFirstOrThrow();
  },
  async findTransactionsForTransactionAccount(
    parameters: FindTransactionsFinancialAccountRepoParameters,
  ) {
    return (parameters.trx ?? db)
      .selectFrom("transaction")
      .where(({ eb, or }) =>
        or([
          eb("from_account_id", "=", parameters.id),
          eb("to_account_id", "=", parameters.id),
        ]),
      )
      .where("user_id", "=", parameters.userId)
      .selectAll()
      .execute();
  },
  async incrementBalance(parameters: IncrementBalanceRepoParameters) {
    return (parameters.trx ?? db)
      .updateTable("financial_account")
      .set((eb) => ({ balance: eb("balance", "+", parameters.amount) }))
      .where("user_id", "=", parameters.userId)
      .where("id", "=", parameters.id)
      .execute();
  },
  async decrementBalance(parameters: DecrementBalanceRepoParameters) {
    return (parameters.trx ?? db)
      .updateTable("financial_account")
      .set((eb) => ({ balance: eb("balance", "-", parameters.amount) }))
      .where("user_id", "=", parameters.userId)
      .where("id", "=", parameters.id)
      .execute();
  },
};
