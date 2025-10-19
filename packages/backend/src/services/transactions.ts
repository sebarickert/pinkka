import * as TransactionRepo from "@/repositories/transactionRepo.js";
import type { NewTransaction } from "@/types/Transaction.js";
import type { NewTransactionDto } from "@pinkka/schemas/TransactionDto.js";
import { db } from "@/lib/db.js";
import { linkTransactionCategories } from "@/services/transaction-category.js";
import { updateAccountBalances } from "@/services/financial-accounts.js";

export async function createTransactions(
  data: NewTransactionDto[],
  user_id: string
): Promise<NewTransaction[]> {
  const parsedTransactions = data.map(({ category_id, ...rest }) => ({
    ...rest,
    user_id,
  }));

  return db.transaction().execute(async (trx) => {
    const newTransactions = await TransactionRepo.createMany(
      { data: parsedTransactions },
      trx
    );

    await linkTransactionCategories(newTransactions, data, trx);
    await updateAccountBalances(newTransactions, trx);

    return newTransactions;
  });
}
