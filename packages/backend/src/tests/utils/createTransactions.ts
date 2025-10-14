import type { UserWithSessionToken } from "@/tests/utils/createTestUser.js";
import { fetcher } from "@/tests/utils/fetcher.js";
import type { Transaction } from "@/types/Transaction.js";
import type { NewTransactionDto } from "@pinkka/schemas/TransactionDto.js";

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
