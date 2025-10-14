import { db } from "@/lib/db.js";
import { fetcher } from "@/tests/utils/fetcher.js";
import {
  createTestUser,
  type UserWithSessionToken,
} from "@/tests/utils/createTestUser.js";
import { beforeEach, describe, expect, test } from "vitest";
import { cleanDb } from "@/tests/utils/cleanDb.js";
import { createAccount } from "@/tests/utils/createAccount.js";
import { createTransactions } from "@/tests/utils/createTransactions.js";
import type { FinancialAccount } from "@/types/FinancialAccount.js";
import type { NewTransactionDto } from "@pinkka/schemas/TransactionDto.js";
import type { Transaction } from "@/types/Transaction.js";

describe("Financial Account Integration Tests", () => {
  let user: UserWithSessionToken;
  let account: FinancialAccount;

  beforeEach(async () => {
    await cleanDb();
    user = await createTestUser();
    account = await createAccount(
      {
        name: "Test Account",
        initial_balance: 1000,
        type: "bank",
        currency: "EUR",
      },
      user
    );
  });

  describe("Authorization", () => {
    const protectedEndpoints = [
      { method: "GET", path: "/api/transactions" },
      { method: "POST", path: "/api/transactions" },
      { method: "GET", path: "/api/transactions/some-id" },
      { method: "PUT", path: "/api/transactions/some-id" },
      { method: "DELETE", path: "/api/transactions/some-id" },
    ];

    protectedEndpoints.forEach(({ method, path }) => {
      test(`returns 401 for unauthorized ${method} ${path}`, async () => {
        const res = await fetcher(path, { method });
        const body = await res.json();

        expect(res.status).toEqual(401);
        expect(body.status).toEqual("error");
        expect(body.message).toBe("Unauthorized");
      });
    });
  });

  describe("GET /transactions/:id", () => {
    let transactions: Transaction[];

    beforeEach(async () => {
      const newTransactionsPayload: Omit<NewTransactionDto, "is_deleted">[] = [
        {
          description: "Grocery Shopping",
          amount: 50,
          from_account_id: account.id,
          type: "expense",
          date: new Date(),
        },
      ];

      transactions = await createTransactions(newTransactionsPayload, user);
    });

    test("returns the transaction for given id", async () => {
      const res = await fetcher(
        `/api/transactions/${transactions[0].id}`,
        {},
        user.session_token
      );

      const body = await res.json();

      expect(res.status).toEqual(200);
      expect(body.status).toEqual("success");
      expect(body.data).toMatchObject(transactions[0]);
    });

    test("returns 404 when transaction does not exist", async () => {
      const id = "c2b8f3ee-c9ae-4104-8f89-173e3871ebb9";

      const res = await fetcher(
        `/api/transactions/${id}`,
        {},
        user.session_token
      );

      const body = await res.json();

      expect(res.status).toEqual(404);
      expect(body.status).toEqual("error");
      expect(body.message).toBe(`Transaction with id ${id} not found`);
    });

    test("returns validation error if id is not a valid uuid", async () => {
      const res = await fetcher(
        `/api/transactions/some-non-existing-id`,
        {},
        user.session_token
      );

      const body = await res.json();

      expect(res.status).toEqual(400);
      expect(body.status).toEqual("error");
      expect(body.message).toBe("Invalid id format");
    });
  });

  describe("GET /transactions", () => {
    test("returns empty array when user has no transactions", async () => {
      const res = await fetcher("/api/transactions", {}, user.session_token);

      const body = await res.json();

      expect(res.status).toEqual(200);
      expect(body.status).toEqual("success");
      expect(body.data).toEqual([]);
    });

    test("returns all transactions for user", async () => {
      const newTransactions: Omit<NewTransactionDto, "is_deleted">[] = [
        {
          description: "Grocery Shopping",
          amount: 50,
          from_account_id: account.id,
          type: "expense",
          date: new Date(),
        },
        {
          description: "Money!",
          amount: 100,
          to_account_id: account.id,
          type: "income",
          date: new Date(),
        },
      ];

      await fetcher(
        "/api/transactions",
        {
          method: "POST",
          body: JSON.stringify(newTransactions),
        },
        user.session_token
      );

      const res = await fetcher("/api/transactions", {}, user.session_token);

      const body = await res.json();

      expect(res.status).toEqual(200);
      expect(body.status).toEqual("success");
      expect(body.data).toHaveLength(newTransactions.length);

      body.data.forEach((transaction: any) => {
        expect(transaction.user_id).toEqual(user.id);
      });
    });
  });

  describe("POST /transactions", async () => {
    test("returns validation errors for multiple transactions with invalid data", async () => {
      const newInvalidTransactionsPayload = [
        {
          description: "Grocery Shopping",
          from_account_id: account.id,
          type: "expense",
          date: new Date(),
        },
        {
          description: "Money!",
          amount: 100,
          to_account_id: account.id,
          type: "income",
        },
        {
          description: "taxes :(",
          amount: 20,
          from_account_id: account.id,
          type: "pöö",
          date: new Date(),
        },
      ];

      const res = await fetcher(
        "/api/transactions",
        {
          method: "POST",
          body: JSON.stringify(newInvalidTransactionsPayload),
        },
        user.session_token
      );

      const body = await res.json();

      expect(res.status).toEqual(400);
      expect(body.status).toEqual("fail");
      expect(body.data[0]).toHaveProperty("amount");
      expect(body.data[1]).toHaveProperty("date");
      expect(body.data[2]).toHaveProperty("type");
    });

    test("creates transaction with valid data", async () => {
      const newTransactionsPayload: Omit<NewTransactionDto, "is_deleted">[] = [
        {
          description: "Grocery Shopping",
          amount: 50,
          from_account_id: account.id,
          type: "expense",
          date: new Date(),
        },
      ];

      const res = await fetcher(
        "/api/transactions",
        {
          method: "POST",
          body: JSON.stringify(newTransactionsPayload),
        },
        user.session_token
      );

      const body = await res.json();

      expect(res.status).toEqual(201);
      expect(body.status).toEqual("success");
      expect(body.data).toHaveLength(1);

      const newTransactionIds = body.data.map(
        (transaction: { id: string }) => transaction.id
      );

      const newTransactions = await db
        .selectFrom("transaction")
        .where("id", "in", newTransactionIds)
        .selectAll()
        .execute();

      expect(newTransactions).toHaveLength(1);
      newTransactions.forEach((payload, i) => {
        expect(newTransactions[i]).toMatchObject({
          ...payload,
          id: newTransactions[i].id,
        });
      });
    });

    test("creates multiple transactions with valid data", async () => {
      const newTransactionsPayload: Omit<NewTransactionDto, "is_deleted">[] = [
        {
          description: "Grocery Shopping",
          amount: 50,
          from_account_id: account.id,
          type: "expense",
          date: new Date(),
        },
        {
          description: "Money!",
          amount: 100,
          to_account_id: account.id,
          type: "income",
          date: new Date(),
        },
        {
          description: "taxes :(",
          amount: 20,
          from_account_id: account.id,
          type: "expense",
          date: new Date(),
        },
      ];

      const res = await fetcher(
        "/api/transactions",
        {
          method: "POST",
          body: JSON.stringify(newTransactionsPayload),
        },
        user.session_token
      );

      const body = await res.json();

      expect(res.status).toEqual(201);
      expect(body.status).toEqual("success");
      expect(body.data).toHaveLength(3);

      const newTransactionIds = body.data.map(
        (transaction: { id: string }) => transaction.id
      );

      const newTransactions = await db
        .selectFrom("transaction")
        .where("id", "in", newTransactionIds)
        .selectAll()
        .execute();

      expect(newTransactions).toHaveLength(3);
      newTransactions.forEach((payload, i) => {
        expect(newTransactions[i]).toMatchObject({
          ...payload,
          id: newTransactions[i].id,
        });
      });
    });
  });

  describe("PUT /transactions/:id", () => {
    let transactions: Transaction[];

    beforeEach(async () => {
      const newTransactionsPayload: Omit<NewTransactionDto, "is_deleted">[] = [
        {
          description: "Grocery Shopping",
          amount: 50,
          from_account_id: account.id,
          type: "expense",
          date: new Date(),
        },
      ];

      transactions = await createTransactions(newTransactionsPayload, user);
    });

    test("updates transaction with valid data", async () => {
      const transactionBefore = await db
        .selectFrom("transaction")
        .where("id", "=", transactions[0].id)
        .selectAll()
        .executeTakeFirst();

      const res = await fetcher(
        `/api/transactions/${transactions[0].id}`,
        {
          method: "PUT",
          body: JSON.stringify({
            amount: 100,
            description: "I was just updated!",
          }),
        },
        user.session_token
      );

      const body = await res.json();

      expect(res.status).toEqual(200);
      expect(body.status).toEqual("success");

      const transactionAfter = await db
        .selectFrom("transaction")
        .where("id", "=", transactions[0].id)
        .selectAll()
        .executeTakeFirst();

      expect(transactionAfter).not.toMatchObject(transactionBefore!);
    });

    test("sending empty body results in no changes", async () => {
      const transactionBefore = await db
        .selectFrom("transaction")
        .where("id", "=", transactions[0].id)
        .selectAll()
        .executeTakeFirst();

      const res = await fetcher(
        `/api/transactions/${transactions[0].id}`,
        {
          method: "PUT",
        },
        user.session_token
      );

      const body = await res.json();

      expect(res.status).toEqual(200);
      expect(body.status).toEqual("success");

      const transactionAfter = await db
        .selectFrom("transaction")
        .where("id", "=", transactions[0].id)
        .selectAll()
        .executeTakeFirst();

      expect(transactionAfter).toMatchObject(transactionBefore!);
    });

    test("returns validation error if id is not a valid uuid", async () => {
      const res = await fetcher(
        `/api/transactions/some-non-existing-id`,
        {
          method: "PUT",
          body: JSON.stringify({
            name: "I do not exist",
          }),
        },
        user.session_token
      );

      const body = await res.json();

      expect(res.status).toEqual(400);
      expect(body.status).toEqual("error");
      expect(body.message).toBe("Invalid id format");
    });

    test("returns validation errors if trying to update with invalid data", async () => {
      const res = await fetcher(
        `/api/transactions/${transactions[0].id}`,
        {
          method: "PUT",
          body: JSON.stringify({
            amount: -123,
            description: 123,
          }),
        },
        user.session_token
      );

      const body = await res.json();

      expect(res.status).toEqual(400);
      expect(body.status).toEqual("fail");
      expect(body.data).toHaveProperty("amount");
      expect(body.data).toHaveProperty("description");
    });

    test("returns 404 when trying to update non-existing transaction", async () => {
      const id = "c2b8f3ee-c9ae-4104-8f89-173e3871ebb9";

      const res = await fetcher(
        `/api/transactions/${id}`,
        {
          method: "PUT",
          body: JSON.stringify({
            description: "I do not exist",
          }),
        },
        user.session_token
      );

      const body = await res.json();

      expect(res.status).toEqual(404);
      expect(body.status).toEqual("error");
      expect(body.message).toBe(`Transaction with id ${id} not found`);
    });

    // TODO: Implement this test when transactions are implemented
    test.skip("prevents updating initial_balance if account has transactions", async () => {});

    test("returns 404 when trying to update deleted transaction", async () => {
      await fetcher(
        `/api/transactions/${transactions[0].id}`,
        {
          method: "PUT",
          body: JSON.stringify({
            is_deleted: true,
          }),
        },
        user.session_token
      );

      const res = await fetcher(
        `/api/transactions/${transactions[0].id}`,
        {
          method: "PUT",
          body: JSON.stringify({
            name: "Trying to update deleted transaction",
          }),
        },
        user.session_token
      );

      const body = await res.json();

      expect(res.status).toEqual(404);
      expect(body.status).toEqual("error");
      expect(body.message).toBe(
        `Transaction with id ${transactions[0].id} not found`
      );
    });
  });

  describe("DELETE /transactions/:id", () => {
    let transactions: Transaction[];

    beforeEach(async () => {
      const newTransactionsPayload: Omit<NewTransactionDto, "is_deleted">[] = [
        {
          description: "Grocery Shopping",
          amount: 50,
          from_account_id: account.id,
          type: "expense",
          date: new Date(),
        },
      ];

      transactions = await createTransactions(newTransactionsPayload, user);
    });

    test("soft-deletes transaction", async () => {
      const transactionBefore = await db
        .selectFrom("transaction")
        .where("id", "=", transactions[0].id)
        .selectAll()
        .executeTakeFirst();

      expect(transactionBefore?.is_deleted).toBe(false);

      const res = await fetcher(
        `/api/transactions/${transactions[0].id}`,
        {
          method: "DELETE",
        },
        user.session_token
      );

      const body = await res.json();

      expect(res.status).toEqual(200);
      expect(body.status).toEqual("success");
      expect(body.data.is_deleted).toBe(true);

      const transactionAfter = await db
        .selectFrom("transaction")
        .where("id", "=", transactions[0].id)
        .selectAll()
        .executeTakeFirst();

      expect(transactionAfter?.is_deleted).toBe(true);
    });

    test("returns 404 when trying to delete non-existing account", async () => {
      const id = "c2b8f3ee-c9ae-4104-8f89-173e3871ebb9";

      const res = await fetcher(
        `/api/transactions/${id}`,
        {
          method: "DELETE",
        },
        user.session_token
      );

      const body = await res.json();

      expect(res.status).toEqual(404);
      expect(body.status).toEqual("error");
      expect(body.message).toBe(`Transaction with id ${id} not found`);
    });

    test("returns validation error if id is not a valid uuid", async () => {
      const res = await fetcher(
        `/api/transactions/some-non-existing-id`,
        {
          method: "DELETE",
        },
        user.session_token
      );

      const body = await res.json();

      expect(res.status).toEqual(400);
      expect(body.status).toEqual("error");
      expect(body.message).toBe("Invalid id format");
    });
  });
});
