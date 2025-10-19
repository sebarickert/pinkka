import { db } from "@/lib/db.js";

export async function getFinancialAccountBalances(id: string) {
  const result = await db
    .selectFrom("financial_account")
    .where("id", "=", id)
    .select(["initial_balance", "balance"])
    .executeTakeFirst();

  return {
    initial_balance: Number(result?.initial_balance),
    balance: Number(result?.balance),
  };
}
