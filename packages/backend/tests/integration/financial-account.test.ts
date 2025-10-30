import { beforeEach, describe, expect, test } from "vitest";
import { cleanDb } from "tests/utils/clean-db.js";
import type {
  FinancialAccountDto,
  UpdateFinancialAccountDto,
} from "@pinkka/schemas/financial-account-dto.js";
import type { JsonResponse } from "@pinkka/schemas/json-response.js";
import {
  type UserWithSessionToken,
  createTestUser,
} from "@/test-utils/create-test-user.js";
import { fetcher } from "@/test-utils/fetcher.js";
import { createTransaction } from "@/test-utils/transaction.js";
import {
  createFinancialAccount,
  deleteFinancialAccount,
  getFinancialAccount,
  getFinancialAccounts,
  updateFinancialAccount,
} from "@/test-utils/financial-account.js";
import { db } from "@/lib/db.js";
import { FinancialAccountMapper } from "@/mappers/financial-account-mapper.js";

describe("Financial Account Integration Tests", () => {
  let user: UserWithSessionToken;

  beforeEach(async () => {
    await cleanDb();
    user = await createTestUser();
  });

  describe("Authorization", () => {
    const protectedEndpoints = [
      { method: "GET", path: "/api/accounts" },
      { method: "POST", path: "/api/accounts" },
      { method: "GET", path: "/api/accounts/some-id" },
      { method: "PUT", path: "/api/accounts/some-id" },
      { method: "DELETE", path: "/api/accounts/some-id" },
    ];

    for (const { method, path } of protectedEndpoints) {
      test(`returns 401 for unauthorized ${method} ${path}`, async () => {
        const response = await fetcher(path, { method });
        const body = (await response.json()) as JsonResponse;

        expect(response.status).toEqual(401);
        expect(body.status).toEqual("error");
        if ("message" in body) {
          expect(body.message).toEqual("Unauthorized");
        }
      });
    }
  });

  describe("GET /accounts/:id", () => {
    let account: FinancialAccountDto;

    beforeEach(async () => {
      const newAccountPayload = {
        type: "bank",
        name: "Hola!",
        initialBalance: 1000,
      } as const;

      const { data } = await createFinancialAccount(newAccountPayload, user);
      account = data;
    });

    test("returns the financial account for given id", async () => {
      const { status, body } = await getFinancialAccount(account.id, user);
      expect(status).toEqual(200);
      expect(body.status).toEqual("success");
      expect(body.data).toMatchObject(account);
    });

    test("returns 404 when account does not exist", async () => {
      const id = "c2b8f3ee-c9ae-4104-8f89-173e3871ebb9";
      const { status, body } = await getFinancialAccount(id, user);
      expect(status).toEqual(404);
      expect(body.status).toEqual("error");
      if ("message" in body) {
        expect(body.message).toEqual(
          `Financial account with id ${id} not found`,
        );
      }
    });

    test("returns validation error if id is not a valid uuid", async () => {
      const { status, body } = await getFinancialAccount(
        "some-non-existing-id",
        user,
      );
      expect(status).toEqual(400);
      expect(body.status).toEqual("error");
      if ("message" in body) {
        expect(body.message).toEqual("Invalid id format");
      }
    });
  });

  describe("GET /accounts", () => {
    test("returns empty array when user has no financial accounts", async () => {
      const { status, body } = await getFinancialAccounts(user);
      expect(status).toEqual(200);
      expect(body.status).toEqual("success");
      expect(body.data).toEqual([]);
    });

    test("returns all financial accounts for user", async () => {
      const newAccounts = [
        {
          type: "bank",
          name: "Hola!",
          initialBalance: 1000,
        },
        {
          type: "wallet",
          name: "Petty Cash",
          initialBalance: 500,
        },
      ] as const;

      await Promise.all(
        newAccounts.map(async (payload) =>
          createFinancialAccount(payload, user),
        ),
      );

      const { status, body, data } = await getFinancialAccounts(user);

      expect(status).toEqual(200);
      expect(body.status).toEqual("success");
      expect(data).toHaveLength(newAccounts.length);

      for (const account of data) {
        expect(account.userId).toEqual(user.id);
      }
    });
  });

  describe("POST /accounts", () => {
    const newAccountPayload = {
      type: "bank",
      name: "Hola!",
      initialBalance: 1000,
    } as const;

    test("returns validation errors if required fields are missing", async () => {
      const { status, body } = await createFinancialAccount(undefined, user);
      expect(status).toEqual(400);
      expect(body.status).toEqual("fail");
      expect(body.data).toHaveProperty("name");
      expect(body.data).toHaveProperty("initialBalance");
      expect(body.data).toHaveProperty("type");
    });

    test("creates financial account with valid data", async () => {
      const { status, body, data } = await createFinancialAccount(
        newAccountPayload,
        user,
      );
      expect(status).toEqual(201);
      expect(body.status).toEqual("success");

      const newAccount = await db
        .selectFrom("financial_account")
        .where("id", "=", data.id)
        .selectAll()
        .executeTakeFirst();

      expect(FinancialAccountMapper.fromDb(newAccount!)).toMatchObject({
        ...newAccountPayload,
        id: newAccount?.id,
        initialBalance: newAccountPayload.initialBalance,
        balance: newAccountPayload.initialBalance,
      });

      expect(newAccount?.is_deleted).toBeDefined();
      expect(newAccount?.created_at).toBeDefined();
      expect(newAccount?.updated_at).toBeDefined();
    });

    test("creates financial account with negative initial_balance", async () => {
      const newAccountPayloadNegative = {
        ...newAccountPayload,
        initialBalance: -1000,
      } as const;

      const { status, body, data } = await createFinancialAccount(
        newAccountPayloadNegative,
        user,
      );

      expect(status).toEqual(201);
      expect(body.status).toEqual("success");

      const newAccount = await db
        .selectFrom("financial_account")
        .where("id", "=", data.id)
        .selectAll()
        .executeTakeFirst();

      expect(FinancialAccountMapper.fromDb(newAccount!)).toMatchObject({
        ...newAccountPayload,
        id: newAccount?.id,
        initialBalance: newAccountPayloadNegative.initialBalance,
        balance: newAccountPayloadNegative.initialBalance,
      });

      expect(newAccount?.is_deleted).toBeDefined();
      expect(newAccount?.created_at).toBeDefined();
      expect(newAccount?.updated_at).toBeDefined();
    });
  });

  describe("PUT /accounts/:id", () => {
    let account: FinancialAccountDto;

    beforeEach(async () => {
      const newAccountPayload = {
        type: "bank",
        name: "Hola!",
        initialBalance: 1000,
      } as const;

      const { body } = await createFinancialAccount(newAccountPayload, user);
      account = body.data as FinancialAccountDto;
    });

    test("updates financial account with valid data", async () => {
      const accountBefore = await db
        .selectFrom("financial_account")
        .where("id", "=", account.id)
        .selectAll()
        .executeTakeFirst();

      const { status, body } = await updateFinancialAccount(
        account.id,
        {
          name: "I was just updated!",
          type: "wallet",
          initialBalance: 5000,
        },
        user,
      );

      expect(status).toEqual(200);
      expect(body.status).toEqual("success");

      const accountAfter = await db
        .selectFrom("financial_account")
        .where("id", "=", account.id)
        .selectAll()
        .executeTakeFirst();

      expect(accountAfter).not.toMatchObject(accountBefore!);
    });

    test("sending empty body results in no changes", async () => {
      const accountBefore = await db
        .selectFrom("financial_account")
        .where("id", "=", account.id)
        .selectAll()
        .executeTakeFirst();

      const { status, body } = await updateFinancialAccount(
        account.id,
        {},
        user,
      );

      expect(status).toEqual(200);
      expect(body.status).toEqual("success");

      const accountAfter = await db
        .selectFrom("financial_account")
        .where("id", "=", account.id)
        .selectAll()
        .executeTakeFirst();

      expect(accountAfter).toMatchObject(accountBefore!);
    });

    test("returns validation error if id is not a valid uuid", async () => {
      const { status, body } = await updateFinancialAccount(
        "some-non-existing-id",
        {
          name: "I was just updated!",
          type: "wallet",
          initialBalance: 5000,
        },
        user,
      );

      expect(status).toEqual(400);
      expect(body.status).toEqual("error");
      if ("message" in body) {
        expect(body.message).toEqual("Invalid id format");
      }
    });

    test("returns validation errors if trying to update with invalid data", async () => {
      const { status, body } = await updateFinancialAccount(
        account.id,
        {
          name: "I was just updated!",
          type: "wrong",
          initialBalance: 5000,
        } as unknown as UpdateFinancialAccountDto,
        user,
      );

      expect(status).toEqual(400);
      expect(body.status).toEqual("fail");
      expect(body.data).toHaveProperty("type");
    });

    test("returns 404 when trying to update non-existing account", async () => {
      const id = "c2b8f3ee-c9ae-4104-8f89-173e3871ebb9";

      const { status, body } = await updateFinancialAccount(
        id,
        {
          name: "I do not exist",
        },
        user,
      );

      expect(status).toEqual(404);
      expect(body.status).toEqual("error");
      if ("message" in body) {
        expect(body.message).toEqual(
          `Financial account with id ${id} not found`,
        );
      }
    });

    test("prevents updating initial_balance if account has transactions", async () => {
      const newTransactionPayload = {
        description: "Grocery Shopping",
        amount: 50,
        fromAccountId: account.id,
        type: "expense",
        date: new Date().toISOString(),
      } as const;

      await createTransaction(newTransactionPayload, user);

      const { status, body } = await updateFinancialAccount(
        account.id,
        {
          initialBalance: 6000,
        },
        user,
      );

      expect(status).toEqual(400);
      expect(body.status).toEqual("fail");
      expect(body.data).toHaveProperty("initialBalance");
    });

    test("returns 404 when trying to update deleted account", async () => {
      await updateFinancialAccount(
        account.id,
        {
          isDeleted: true,
        },
        user,
      );

      const { status, body } = await updateFinancialAccount(
        account.id,
        {
          name: "Trying to update deleted account",
        },
        user,
      );

      expect(status).toEqual(404);
      expect(body.status).toEqual("error");

      if ("message" in body) {
        expect(body.message).toEqual(
          `Financial account with id ${account.id} not found`,
        );
      }
    });
  });

  describe("DELETE /accounts/:id", () => {
    let account: FinancialAccountDto;

    beforeEach(async () => {
      const newAccountPayload = {
        type: "bank",
        name: "Hola!",
        initialBalance: 1000,
      } as const;

      const { body } = await createFinancialAccount(newAccountPayload, user);
      account = body.data as FinancialAccountDto;
    });

    test("soft-deletes the financial account", async () => {
      const accountBefore = await db
        .selectFrom("financial_account")
        .where("id", "=", account.id)
        .selectAll()
        .executeTakeFirst();

      expect(accountBefore?.is_deleted).toEqual(false);

      const { status, body, data } = await deleteFinancialAccount(
        account.id,
        user,
      );

      expect(status).toEqual(200);
      expect(body.status).toEqual("success");
      expect(data.isDeleted).toEqual(true);

      const accountAfter = await db
        .selectFrom("financial_account")
        .where("id", "=", account.id)
        .selectAll()
        .executeTakeFirst();

      expect(accountAfter?.is_deleted).toEqual(true);
    });

    test("returns 404 when trying to delete non-existing account", async () => {
      const id = "c2b8f3ee-c9ae-4104-8f89-173e3871ebb9";
      const { status, body } = await deleteFinancialAccount(id, user);

      expect(status).toEqual(404);
      expect(body.status).toEqual("error");
      if ("message" in body) {
        expect(body.message).toEqual(
          `Financial account with id ${id} not found`,
        );
      }
    });

    test("returns validation error if id is not a valid uuid", async () => {
      const { status, body } = await deleteFinancialAccount(
        "some-non-existing-id",
        user,
      );

      expect(status).toEqual(400);
      expect(body.status).toEqual("error");
      if ("message" in body) {
        expect(body.message).toEqual("Invalid id format");
      }
    });
  });
});
