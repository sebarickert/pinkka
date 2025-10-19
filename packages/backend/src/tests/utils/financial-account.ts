import { db } from "@/lib/db.js";

export async function getFinancialAccountBalances(id: string) {
  return db
    .selectFrom("financial_account")
    .where("id", "=", id)
    .select(["initial_balance", "balance"])
    .executeTakeFirst();
}
