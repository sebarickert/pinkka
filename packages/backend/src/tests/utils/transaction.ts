import { db } from "@/lib/db.js";
import { fetcher } from "@/tests/utils/fetcher.js";
import type { UserWithSessionToken } from "@/tests/utils/createTestUser.js";
import type { Transaction } from "@/types/Transaction.js";
import type { NewTransactionDto } from "@pinkka/schemas/TransactionDto.js";
import { expect } from "vitest";

export async function createTransactions(
  newTransactionsPayload: Omit<NewTransactionDto, "is_deleted">[],
  user: UserWithSessionToken
): Promise<Transaction[]> {
  const res = await fetcher(
    "/api/transactions",
    {
      method: "POST",
      body: JSON.stringify(newTransactionsPayload),
    },
    user.session_token
  );

  const body = await res.json();

  return body.data;
}

export async function getTransactionCategoryLinks(transactionId: string) {
  return db
    .selectFrom("transaction_category")
    .where("transaction_id", "=", transactionId)
    .selectAll()
    .execute();
}

export async function updateTransaction(id: string, body: any, token: string) {
  const res = await fetcher(
    `/api/transactions/${id}`,
    {
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    },
    token
  );
  const json = await res.json();
  return { status: res.status, body: json };
}

export async function getTransaction(id: string) {
  return db
    .selectFrom("transaction")
    .where("id", "=", id)
    .selectAll()
    .executeTakeFirst();
}

export async function expectCategoryLink(
  transactionId: string,
  expectedCategoryId: string | null
) {
  const links = await getTransactionCategoryLinks(transactionId);
  if (expectedCategoryId) {
    expect(links).toHaveLength(1);
    expect(links[0].category_id).toEqual(expectedCategoryId);
  } else {
    expect(links).toHaveLength(0);
  }
}
