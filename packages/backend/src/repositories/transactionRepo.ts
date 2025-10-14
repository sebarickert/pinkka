import { db } from "@/lib/db.js";
import type { BaseQueryOptions } from "@/repositories/financialAccountRepo.js";
import type {
  Transaction,
  TransactionUpdate,
  NewTransaction,
} from "@/types/Transaction.js";

interface CreateManyTransactionParams extends BaseQueryOptions {
  data: NewTransaction[];
}

export async function createMany({
  data,
}: CreateManyTransactionParams): Promise<Transaction[]> {
  return await db
    .insertInto("transaction")
    .values(data)
    .returningAll()
    .execute();
}

interface FindOneTransactionParams extends BaseQueryOptions {
  id: string;
  user_id: string;
}

export async function findOne({
  id,
  user_id,
}: FindOneTransactionParams): Promise<Transaction | undefined> {
  return await db
    .selectFrom("transaction")
    .where("id", "=", id)
    .where("user_id", "=", user_id)
    .selectAll()
    .executeTakeFirst();
}

interface FindManyTransactionParams extends BaseQueryOptions {
  user_id: string;
}

export async function findMany({
  user_id,
}: FindManyTransactionParams): Promise<Transaction[]> {
  return await db
    .selectFrom("transaction")
    .where("user_id", "=", user_id)
    .where("is_deleted", "=", false)
    .selectAll()
    .execute();
}

interface UpdateTransactionParams extends BaseQueryOptions {
  id: string;
  user_id: string;
  data: TransactionUpdate;
}

export async function update({
  id,
  user_id,
  data,
}: UpdateTransactionParams): Promise<Transaction> {
  return await db
    .updateTable("transaction")
    .where("id", "=", id)
    .where("user_id", "=", user_id)
    .set(data)
    .returningAll()
    .executeTakeFirstOrThrow();
}
