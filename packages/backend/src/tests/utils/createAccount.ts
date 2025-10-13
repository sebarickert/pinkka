import type { UserWithSessionToken } from "@/tests/utils/createTestUser.js";
import { fetcher } from "@/tests/utils/fetcher.js";
import type { FinancialAccount } from "@/types/FinancialAccount.js";
import type { NewFinancialAccountDto } from "@pinkka/schemas/FinancialAccountDto.js";

export async function createAccount(
  newAccountPayload: NewFinancialAccountDto,
  user: UserWithSessionToken
): Promise<FinancialAccount> {
  const res = await fetcher(
    "/api/accounts",
    {
      method: "POST",
      body: JSON.stringify(newAccountPayload),
    },
    user.session_token
  );

  const body = await res.json();

  return body.data;
}
