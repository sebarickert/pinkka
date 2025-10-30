import { db } from "@/lib/db.js";
import type { Category } from "@/types/db/category1.js";
import type { TransactionCategory } from "@/types/db/transaction-category1.js";
import type {
  CreateCategoryParameters,
  DeleteCategoryParameters,
  FindOneCategoryParameters,
  FindTransactionLinksCategoryParameters,
  GetAllCategoryParameters,
  UpdateCategoryParameters,
} from "@/types/repo/category.js";

export const CategoryRepo = {
  async create(parameters: CreateCategoryParameters): Promise<Category> {
    return (parameters.trx ?? db)
      .insertInto("category")
      .values(parameters.data)
      .returningAll()
      .executeTakeFirstOrThrow();
  },
  async findOne(
    parameters: FindOneCategoryParameters
  ): Promise<Category | undefined> {
    return (parameters.trx ?? db)
      .selectFrom("category")
      .where("id", "=", parameters.id)
      .where("user_id", "=", parameters.userId)
      .selectAll()
      .executeTakeFirst();
  },
  async getAll(parameters: GetAllCategoryParameters): Promise<Category[]> {
    return (parameters.trx ?? db)
      .selectFrom("category")
      .where("user_id", "=", parameters.userId)
      .where("is_deleted", "=", false)
      .selectAll()
      .execute();
  },
  async update(parameters: UpdateCategoryParameters): Promise<Category> {
    return (parameters.trx ?? db)
      .updateTable("category")
      .where("id", "=", parameters.id)
      .where("user_id", "=", parameters.userId)
      .set(parameters.data)
      .returningAll()
      .executeTakeFirstOrThrow();
  },
  async delete(parameters: DeleteCategoryParameters): Promise<Category> {
    return (parameters.trx ?? db)
      .updateTable("category")
      .where("id", "=", parameters.id)
      .where("user_id", "=", parameters.userId)
      .set({ is_deleted: true })
      .returningAll()
      .executeTakeFirstOrThrow();
  },
  async findTransactionLinks(
    parameters: FindTransactionLinksCategoryParameters
  ): Promise<TransactionCategory[]> {
    return (parameters.trx ?? db)
      .selectFrom("transaction_category")
      .where("category_id", "=", parameters.id)
      .selectAll()
      .execute();
  },
};
