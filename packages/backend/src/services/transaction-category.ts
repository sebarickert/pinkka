import * as TransactionCategoryRepo from "@/repositories/transactionCategoryRepo.js";
import type { Database } from "@/types/Database.js";
import type { NewTransaction } from "@/types/Transaction.js";
import type { NewTransactionDto } from "@pinkka/schemas/TransactionDto.js";
import type { Transaction } from "kysely";

export async function linkTransactionCategories(
  transactions: NewTransaction[],
  dtoData: NewTransactionDto[],
  trx: Transaction<Database>
) {
  const links = transactions
    .map((tx, index) => {
      const category_id = dtoData[index]?.category_id;
      if (!category_id) return null;
      return {
        category_id,
        transaction_id: tx.id,
      };
    })
    .filter(Boolean);

  if (links.length === 0) return;

  await Promise.all(
    links.map((link) => TransactionCategoryRepo.create({ data: link! }, trx))
  );
}
