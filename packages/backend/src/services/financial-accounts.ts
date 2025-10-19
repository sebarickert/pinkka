import type { Database } from "@/types/Database.js";
import type { NewTransaction } from "@/types/Transaction.js";
import type { Transaction } from "kysely";

export async function updateAccountBalances(
  transactions: NewTransaction[],
  trx: Transaction<Database>
) {
  const accountIds = Array.from(
    new Set(
      transactions
        .flatMap((tx) => [tx.from_account_id, tx.to_account_id])
        .filter(Boolean)
    )
  );

  if (accountIds.length === 0) return;

  const accounts = await trx
    .selectFrom("financial_account")
    .where("id", "in", accountIds)
    .select(["id", "balance"])
    .execute();

  const balanceMap = new Map(accounts.map((a) => [a.id, Number(a.balance)]));

  for (const tx of transactions) {
    const amount = Number(tx.amount);

    switch (tx.type) {
      case "income":
        if (tx.to_account_id) {
          balanceMap.set(
            tx.to_account_id,
            balanceMap.get(tx.to_account_id)! + amount
          );
        }
        break;
      case "expense":
        if (tx.from_account_id) {
          balanceMap.set(
            tx.from_account_id,
            balanceMap.get(tx.from_account_id)! - amount
          );
        }
        break;
      case "transfer":
        if (tx.from_account_id && tx.to_account_id) {
          balanceMap.set(
            tx.from_account_id,
            balanceMap.get(tx.from_account_id)! - amount
          );
          balanceMap.set(
            tx.to_account_id,
            balanceMap.get(tx.to_account_id)! + amount
          );
        }
        break;
    }
  }

  await Promise.all(
    Array.from(balanceMap.entries()).map(([id, newBalance]) =>
      trx
        .updateTable("financial_account")
        .set({ balance: newBalance })
        .where("id", "=", id)
        .execute()
    )
  );
}
