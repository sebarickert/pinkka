import { db } from "@/lib/db.js";
import type { BaseQueryOptions } from "@/repositories/financialAccountRepo.js";
import type { Database } from "@/types/Database.js";
import type {
  NewTransactionCategory,
  TransactionCategory,
} from "@/types/TransactionCategory.js";
import type { Transaction } from "kysely";
interface CreateTransactionCategoryParams extends BaseQueryOptions {
  data: NewTransactionCategory;
}

export async function create(
  { data: { transaction_id, category_id } }: CreateTransactionCategoryParams,
  trx?: Transaction<Database>
): Promise<TransactionCategory> {
  return (trx ?? db)
    .insertInto("transaction_category")
    .values({ transaction_id, category_id })
    .returningAll()
    .executeTakeFirstOrThrow();
}

interface UpsertTransactionCategoryParams extends BaseQueryOptions {
  data: TransactionCategory;
}

export async function upsert({
  data: { transaction_id, category_id },
}: UpsertTransactionCategoryParams): Promise<TransactionCategory> {
  await db
    .deleteFrom("transaction_category")
    .where("transaction_id", "=", transaction_id)
    .execute();

  // Insert the new link
  return db
    .insertInto("transaction_category")
    .values({ transaction_id, category_id })
    .returningAll()
    .executeTakeFirstOrThrow();
}

export async function deleteLink({
  data: { transaction_id },
}: {
  data: {
    transaction_id: string;
  };
}) {
  return db
    .deleteFrom("transaction_category")
    .where("transaction_id", "=", transaction_id)
    .execute();
}
