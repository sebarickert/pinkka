import { db } from "@/lib/db.js";
import { fetcher } from "@/tests/utils/fetcher.js";
import {
  createTestUser,
  type UserWithSessionToken,
} from "@/tests/utils/createTestUser.js";
import { beforeEach, describe, expect, test } from "vitest";
import { cleanDb } from "@/tests/utils/cleanDb.js";
import { createAccount } from "@/tests/utils/createAccount.js";
import type { FinancialAccount } from "@/types/FinancialAccount.js";
import type { NewTransactionDto } from "@pinkka/schemas/TransactionDto.js";
import type { Transaction } from "@/types/Transaction.js";
import { createCategory } from "@/tests/utils/createCategory.js";
import type { Category } from "@/types/Category.js";
import {
  createTransactions,
  getTransaction,
  updateTransaction,
  expectCategoryLink,
} from "@/tests/utils/transaction.js";

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
        expect(body.message).toEqual("Unauthorized");
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
      expect(body.message).toEqual(`Transaction with id ${id} not found`);
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
      expect(body.message).toEqual("Invalid id format");
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

      body.data.forEach((transaction: Transaction) => {
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

    test("creates transaction with category", async () => {
      const newCategoryPayload = {
        type: "income",
        name: "Hola!",
      } as const;

      const category = await createCategory(newCategoryPayload, user);

      const newTransactionsPayload: Omit<NewTransactionDto, "is_deleted">[] = [
        {
          description: "Grocery Shopping",
          amount: 50,
          to_account_id: account.id,
          type: "income",
          date: new Date(),
          category_id: category.id,
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

      const transactionCategoryLink = await db
        .selectFrom("transaction_category")
        .where("category_id", "=", category.id)
        .selectAll()
        .execute();

      expect(transactionCategoryLink).toHaveLength(1);
      expect(transactionCategoryLink[0].category_id).toEqual(category.id);
      expect(transactionCategoryLink[0].transaction_id).toEqual(
        body.data[0].id
      );
    });
  });

  describe("PUT /transactions/:id", () => {
    let transactions: Transaction[];
    let category1: Category;
    let category2: Category;
    let category3: Category;

    beforeEach(async () => {
      const newCategoryPayload = {
        type: "expense",
        name: "Hola!",
      } as const;

      category1 = await createCategory(newCategoryPayload, user);
      category2 = await createCategory(newCategoryPayload, user);
      category3 = await createCategory(
        { ...newCategoryPayload, type: "income" },
        user
      );

      const newTransactionsPayload: Omit<NewTransactionDto, "is_deleted">[] = [
        {
          description: "Grocery Shopping",
          amount: 50,
          from_account_id: account.id,
          type: "expense",
          date: new Date(),
        },
        {
          description: "Transaction with Category",
          amount: 100,
          from_account_id: account.id,
          type: "expense",
          date: new Date(),
          category_id: category1.id,
        },
      ];

      transactions = await createTransactions(newTransactionsPayload, user);
    });

    describe("Category Link Management", () => {
      test("adds category link", async () => {
        const transactionBefore = await getTransaction(transactions[0].id);
        await expectCategoryLink(transactions[0].id, null);

        const { status, body } = await updateTransaction(
          transactions[0].id,
          {
            amount: 100,
            description: "I was just updated!",
            category_id: category1.id,
          },
          user.session_token
        );

        expect(status).toEqual(200);
        expect(body.status).toEqual("success");
        await expectCategoryLink(transactions[0].id, category1.id);
        const transactionAfter = await getTransaction(transactions[0].id);
        expect(transactionAfter).not.toMatchObject(transactionBefore!);
      });

      test("updates category link", async () => {
        await expectCategoryLink(transactions[1].id, category1.id);
        const { status, body } = await updateTransaction(
          transactions[1].id,
          {
            amount: 100,
            description: "I was just updated!",
            category_id: category2.id,
          },
          user.session_token
        );
        expect(status).toEqual(200);
        expect(body.status).toEqual("success");
        await expectCategoryLink(transactions[1].id, category2.id);
      });

      test("removes category link", async () => {
        await expectCategoryLink(transactions[1].id, category1.id);
        const { status, body } = await updateTransaction(
          transactions[1].id,
          { category_id: null },
          user.session_token
        );
        expect(status).toEqual(200);
        expect(body.status).toEqual("success");
        await expectCategoryLink(transactions[1].id, null);
      });

      test("rejects mismatched category type", async () => {
        const { status, body } = await updateTransaction(
          transactions[0].id,
          { category_id: category3.id },
          user.session_token
        );
        expect(status).toEqual(400);
        expect(body.status).toEqual("fail");
        expect(body.data).toHaveProperty("category_id");
        expect(body.data.category_id).toEqual(
          "Category type does not match transaction type"
        );
        await expectCategoryLink(transactions[0].id, null);
      });

      test("rejects non-existent category_id", async () => {
        const fakeCategoryId = "00000000-0000-0000-0000-000000000000";
        const { status, body } = await updateTransaction(
          transactions[0].id,
          { category_id: fakeCategoryId },
          user.session_token
        );
        expect(status).toEqual(404);
        expect(body.status).toEqual("error");
        expect(body.message).toEqual(
          `Category with id ${fakeCategoryId} not found`
        );
        await expectCategoryLink(transactions[0].id, null);
      });
    });

    describe("General Update & Validation", () => {
      test("updates amount and description only (no category)", async () => {
        // Transaction[0] has no category
        const transactionBefore = await getTransaction(transactions[0].id);
        await expectCategoryLink(transactions[0].id, null);

        const { status, body } = await updateTransaction(
          transactions[0].id,
          {
            amount: transactionBefore!.amount + 10,
            description: "Updated description only",
          },
          user.session_token
        );

        expect(status).toEqual(200);
        expect(body.status).toEqual("success");

        const transactionAfter = await getTransaction(transactions[0].id);
        expect(transactionAfter!.amount).toEqual(
          transactionBefore!.amount + 10
        );
        expect(transactionAfter!.description).toEqual(
          "Updated description only"
        );
        // Category link should remain absent
        await expectCategoryLink(transactions[0].id, null);
      });
      test("sending empty body results in no changes", async () => {
        const transactionBefore = await getTransaction(transactions[0].id);
        const { status, body } = await updateTransaction(
          transactions[0].id,
          undefined,
          user.session_token
        );
        expect(status).toEqual(200);
        expect(body.status).toEqual("success");
        const transactionAfter = await getTransaction(transactions[0].id);
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
        expect(body.message).toEqual("Invalid id format");
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
        expect(body.message).toEqual(`Transaction with id ${id} not found`);
      });

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
        expect(body.message).toEqual(
          `Transaction with id ${transactions[0].id} not found`
        );
      });
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

      expect(transactionBefore?.is_deleted).toEqual(false);

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
      expect(body.data.is_deleted).toEqual(true);

      const transactionAfter = await db
        .selectFrom("transaction")
        .where("id", "=", transactions[0].id)
        .selectAll()
        .executeTakeFirst();

      expect(transactionAfter?.is_deleted).toEqual(true);
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
      expect(body.message).toEqual(`Transaction with id ${id} not found`);
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
      expect(body.message).toEqual("Invalid id format");
    });
  });
});
