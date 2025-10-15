import { db } from "@/lib/db.js";
import type { BaseQueryOptions } from "@/repositories/financialAccountRepo.js";
import type { Category, NewCategory } from "@/types/Category.js";
import type {
  NewTransactionCategory,
  TransactionCategory,
} from "@/types/TransactionCategory.js";

interface CreateTransactionCategoryParams extends BaseQueryOptions {
  data: NewTransactionCategory;
}

export async function create({
  data: { transaction_id, category_id },
}: CreateTransactionCategoryParams): Promise<TransactionCategory> {
  return await db
    .insertInto("transaction_category")
    .values({ transaction_id, category_id })
    .returningAll()
    .executeTakeFirstOrThrow();
}
