import * as FinancialAccountRepo from "@/repositories/financialAccountRepo.js";
import type { Database } from "@/types/db/Database.js";
import type { Transaction } from "@/types/db/Transaction.js";
import type { Transaction as KyselyTransaction } from "kysely";

export async function updateAccountBalancesForTransaction({
  amount,
  transaction,
  trx,
}: {
  amount: number;
  transaction: Transaction;
  trx?: KyselyTransaction<Database>;
}): Promise<void> {
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
}
