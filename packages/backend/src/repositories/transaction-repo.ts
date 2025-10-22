import { db } from "@/lib/db.js";
import type { BaseQueryOptions } from "@/repositories/financial-account-repo.js";
import type {
  Transaction,
  TransactionUpdate,
  NewTransaction,
} from "@/types/db/Transaction.js";

interface CreateOneTransactionParams extends BaseQueryOptions {
  data: NewTransaction;
}

export async function createOne({
  data,
  trx,
}: CreateOneTransactionParams): Promise<Transaction> {
  return (trx ?? db)
    .insertInto("transaction")
    .values(data)
    .returningAll()
    .executeTakeFirstOrThrow();
}

interface FindOneTransactionParams extends BaseQueryOptions {
  id: string;
  user_id: string;
}

export async function findOne({
  id,
  user_id,
}: FindOneTransactionParams): Promise<Transaction | undefined> {
  return db
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
  return db
    .selectFrom("transaction")
    .where("user_id", "=", user_id)
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
  trx,
}: UpdateTransactionParams): Promise<Transaction> {
  return (trx ?? db)
    .updateTable("transaction")
    .where("id", "=", id)
    .where("user_id", "=", user_id)
    .set(data)
    .returningAll()
    .executeTakeFirstOrThrow();
}

interface DeleteTransactionParams extends BaseQueryOptions {
  id: string;
  user_id: string;
}

export async function deleteTransaction({
  id,
  user_id,
  trx,
}: DeleteTransactionParams) {
  return (trx ?? db)
    .deleteFrom("transaction")
    .where("id", "=", id)
    .where("user_id", "=", user_id)
    .execute();
}
