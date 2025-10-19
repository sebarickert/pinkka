import * as TransactionRepo from "@/repositories/transactionRepo.js";
import * as TransactionCategoryRepo from "@/repositories/transactionCategoryRepo.js";
import * as FinancialAccountRepo from "@/repositories/financialAccountRepo.js";
import type { NewTransaction, Transaction } from "@/types/Transaction.js";
import { db } from "@/lib/db.js";

export async function createTransaction({
  data,
  category_id,
}: {
  data: NewTransaction;
  category_id: string | null | undefined;
}): Promise<Transaction> {
  return db.transaction().execute(async (trx) => {
    const transaction = await TransactionRepo.createOne({
      data,
      trx,
    });

    if (category_id) {
      await TransactionCategoryRepo.create({
        data: { category_id, transaction_id: transaction.id },
        trx,
      });
    }

    const amount = Number(transaction.amount);

    if (transaction.type === "income" && transaction.to_account_id) {
      await FinancialAccountRepo.incrementBalance({
        id: transaction.to_account_id,
        amount,
        trx,
      });
    }

    if (transaction.type === "expense" && transaction.from_account_id) {
      await FinancialAccountRepo.decrementBalance({
        id: transaction.from_account_id,
        amount,
        trx,
      });
    }

    if (
      transaction.type === "transfer" &&
      transaction.from_account_id &&
      transaction.to_account_id
    ) {
      await FinancialAccountRepo.decrementBalance({
        id: transaction.from_account_id,
        amount,
        trx,
      });
      await FinancialAccountRepo.incrementBalance({
        id: transaction.to_account_id,
        amount,
        trx,
      });
    }

    return transaction;
  });
}
