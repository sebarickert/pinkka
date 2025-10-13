import { db } from "@/lib/db.js";
import type { BaseQueryOptions } from "@/repositories/financialAccountRepo.js";
import type {
  Category,
  CategoryUpdate,
  NewCategory,
} from "@/types/Category.js";

interface CreateCategoryParams extends BaseQueryOptions {
  data: NewCategory;
}

export async function create({
  data,
}: CreateCategoryParams): Promise<Category> {
  return await db
    .insertInto("category")
    .values(data)
    .returningAll()
    .executeTakeFirstOrThrow();
}

interface FindOneCategoryParams extends BaseQueryOptions {
  id: string;
  user_id: string;
}

export async function findOne({
  id,
  user_id,
}: FindOneCategoryParams): Promise<Category | undefined> {
  return await db
    .selectFrom("category")
    .where("id", "=", id)
    .where("user_id", "=", user_id)
    .selectAll()
    .executeTakeFirst();
}

interface FindManyCategoryParams extends BaseQueryOptions {
  user_id: string;
}

export async function findMany({
  user_id,
}: FindManyCategoryParams): Promise<Category[]> {
  return await db
    .selectFrom("category")
    .where("user_id", "=", user_id)
    .where("is_deleted", "=", false)
    .selectAll()
    .execute();
}

interface UpdateCategoryParams extends BaseQueryOptions {
  id: string;
  user_id: string;
  data: CategoryUpdate;
}

export async function update({
  id,
  user_id,
  data,
}: UpdateCategoryParams): Promise<Category> {
  return await db
    .updateTable("category")
    .where("id", "=", id)
    .where("user_id", "=", user_id)
    .set(data)
    .returningAll()
    .executeTakeFirstOrThrow();
}

interface FindTransactionLinksCategoryParams extends BaseQueryOptions {
  id: string;
}

export async function findTransactionLinksForCategory({
  id,
}: FindTransactionLinksCategoryParams) {
  return await db
    .selectFrom("transaction_category")
    .where("category_id", "=", id)
    .selectAll()
    .execute();
}
