import { db } from "@/lib/db.js";
import type { BaseQueryOptions } from "@/repositories/financial-account-repo.js";
import type {
  Category,
  CategoryUpdate,
  NewCategory,
} from "@/types/db/Category.js";

interface CreateCategoryParams extends BaseQueryOptions {
  data: NewCategory;
}

export async function create({
  data,
}: CreateCategoryParams): Promise<Category> {
  return db
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
  return db
    .selectFrom("category")
    .where("id", "=", id)
    .where("user_id", "=", user_id)
    .selectAll()
    .executeTakeFirst();
}

interface FindManyCategoryParams extends BaseQueryOptions {
  id: string[];
  user_id: string;
}

export async function findMany({
  id,
  user_id,
}: FindManyCategoryParams): Promise<Category[]> {
  return db
    .selectFrom("category")
    .where("user_id", "=", user_id)
    .where("is_deleted", "=", false)
    .where("id", "in", id)
    .selectAll()
    .execute();
}

interface GetAllCategoryParams extends BaseQueryOptions {
  user_id: string;
}

export async function getAll({
  user_id,
}: GetAllCategoryParams): Promise<Category[]> {
  return db
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
  return db
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
  return db
    .selectFrom("transaction_category")
    .where("category_id", "=", id)
    .selectAll()
    .execute();
}
