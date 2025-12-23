import type {
  FinancialAccountDto,
  NewFinancialAccountDto,
} from "@pinkka/schemas/financial-account-dto.js";
import type { JsonResponse } from "@pinkka/schemas/json-response.js";
import type { UserWithSessionToken } from "@/test-utils/create-test-user.js";
import { fetcher } from "@/test-utils/fetcher.js";
import { db } from "@/lib/db.js";

export async function getFinancialAccounts(
  user: UserWithSessionToken,
): Promise<{
  status: number;
  body: JsonResponse<FinancialAccountDto[]>;
  data: FinancialAccountDto[];
}> {
  const response = await fetcher("/api/accounts", {}, user.sessionToken);

  const body = (await response.json()) as JsonResponse<FinancialAccountDto[]>;

  return {
    status: response.status,
    body,
    data: body.data as FinancialAccountDto[],
  };
}

export async function getFinancialAccount(
  id: string,
  user: UserWithSessionToken,
): Promise<{ status: number; body: JsonResponse<FinancialAccountDto> }> {
  const response = await fetcher(`/api/accounts/${id}`, {}, user.sessionToken);

  const body = (await response.json()) as JsonResponse<FinancialAccountDto>;

  return { status: response.status, body };
}

export async function createFinancialAccount(
  newAccountPayload: NewFinancialAccountDto | undefined,
  user: UserWithSessionToken,
): Promise<{
  status: number;
  body: JsonResponse<FinancialAccountDto>;
  data: FinancialAccountDto;
}> {
  const response = await fetcher(
    "/api/accounts",
    {
      method: "POST",
      body: JSON.stringify(newAccountPayload),
    },
    user.sessionToken,
  );

  const body = (await response.json()) as JsonResponse<FinancialAccountDto>;

  return {
    status: response.status,
    body,
    data: body.data as FinancialAccountDto,
  };
}

export async function updateFinancialAccount(
  id: string,
  updateAccountPayload: Partial<FinancialAccountDto>,
  user: UserWithSessionToken,
): Promise<{ status: number; body: JsonResponse<FinancialAccountDto> }> {
  const response = await fetcher(
    `/api/accounts/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(updateAccountPayload),
    },
    user.sessionToken,
  );

  const body = (await response.json()) as JsonResponse<FinancialAccountDto>;

  return { status: response.status, body };
}

export async function deleteFinancialAccount(
  id: string,
  user: UserWithSessionToken,
): Promise<{
  status: number;
  body: JsonResponse<FinancialAccountDto>;
  data: FinancialAccountDto;
}> {
  const response = await fetcher(
    `/api/accounts/${id}`,
    {
      method: "DELETE",
    },
    user.sessionToken,
  );

  const body = (await response.json()) as JsonResponse<FinancialAccountDto>;

  return {
    status: response.status,
    body,
    data: body.data as FinancialAccountDto,
  };
}

export async function getFinancialAccountBalances(id: string) {
  const result = await db
    .selectFrom("financial_account")
    .where("id", "=", id)
    .select(["initial_balance", "balance"])
    .executeTakeFirst();

  return {
    initialBalance: Number(result?.initial_balance),
    balance: Number(result?.balance),
  };
}
