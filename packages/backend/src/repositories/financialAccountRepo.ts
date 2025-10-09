import { db } from "@/lib/db.js";
import type {
  FinancialAccount,
  FinancialAccountUpdate,
  NewFinancialAccount,
} from "@/types/FinancialAccount.js";

export interface BaseQueryOptions {
  sortBy?: string; // default sorting field
  order?: "asc" | "desc"; // default order
  limit?: number; // pagination
  offset?: number; // pagination
  includeDeleted?: boolean; // whether to include soft-deleted records
}

interface CreateFinancialAccountParams extends BaseQueryOptions {
  data: NewFinancialAccount;
}

export async function create({
  data,
}: CreateFinancialAccountParams): Promise<FinancialAccount> {
  return await db
    .insertInto("financial_account")
    .values(data)
    .returningAll()
    .executeTakeFirstOrThrow();
}

interface CreateManyFinancialAccountParams extends BaseQueryOptions {
  data: NewFinancialAccount[];
}

export async function createMany({
  data,
}: CreateManyFinancialAccountParams): Promise<FinancialAccount[]> {
  return await db
    .insertInto("financial_account")
    .values(data)
    .returningAll()
    .execute();
}

interface FindOneFinancialAccountParams extends BaseQueryOptions {
  id: string;
  user_id: string;
}

export async function findOne({
  id,
  user_id,
}: FindOneFinancialAccountParams): Promise<FinancialAccount | undefined> {
  return await db
    .selectFrom("financial_account")
    .where("id", "=", id)
    .where("user_id", "=", user_id)
    .selectAll()
    .executeTakeFirst();
}

interface FindManyFinancialAccountParams extends BaseQueryOptions {
  user_id: string;
}

export async function findMany({
  user_id,
}: FindManyFinancialAccountParams): Promise<FinancialAccount[]> {
  return await db
    .selectFrom("financial_account")
    .where("user_id", "=", user_id)
    .where("is_deleted", "=", false)
    .selectAll()
    .execute();
}

interface UpdateFinancialAccountParams extends BaseQueryOptions {
  id: string;
  user_id: string;
  data: FinancialAccountUpdate;
}

export async function update({
  id,
  user_id,
  data,
}: UpdateFinancialAccountParams): Promise<FinancialAccount> {
  return await db
    .updateTable("financial_account")
    .where("id", "=", id)
    .where("user_id", "=", user_id)
    .set(data)
    .returningAll()
    .executeTakeFirstOrThrow();
}

interface FindTransactionsFinancialAccountParams extends BaseQueryOptions {
  id: string;
  user_id: string;
}

export async function findTransactionsForTransactionAccount({
  id,
  user_id,
}: FindTransactionsFinancialAccountParams) {
  return await db
    .selectFrom("transaction")
    .where(({ eb, or }) =>
      or([eb("from_account_id", "=", id), eb("to_account_id", "=", id)])
    )
    .where("user_id", "=", user_id)
    .selectAll()
    .execute();
}
