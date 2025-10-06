import { db } from "@/lib/db.js";
import type {
  FinancialAccount,
  NewFinancialAccount,
} from "@/types/FinancialAccount.js";

export async function create(
  data: NewFinancialAccount
): Promise<FinancialAccount> {
  return await db
    .insertInto("financial_account")
    .values(data)
    .returningAll()
    .executeTakeFirstOrThrow();
}

export async function createMany(
  user_id: string,
  data: NewFinancialAccount[]
): Promise<FinancialAccount[]> {
  return await db
    .insertInto("financial_account")
    .values(data.map((account) => ({ ...account, user_id })))
    .returningAll()
    .execute();
}

export async function findOne(
  id: string,
  user_id: string
): Promise<FinancialAccount | undefined> {
  return await db
    .selectFrom("financial_account")
    .where("id", "=", id)
    .where("user_id", "=", user_id)
    .selectAll()
    .executeTakeFirst();
}

export async function findMany(user_id: string): Promise<FinancialAccount[]> {
  return await db
    .selectFrom("financial_account")
    .where("user_id", "=", user_id)
    .selectAll()
    .execute();
}
