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
import type { Transaction } from "@/types/Transaction.js";
import { createCategory } from "@/tests/utils/createCategory.js";
import type { Category } from "@/types/Category.js";
import {
  createTransaction,
  getTransaction,
  updateTransaction,
  expectCategoryLink,
} from "@/tests/utils/transaction.js";
import { getFinancialAccountBalances } from "@/tests/utils/financial-account.js";

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
    let transaction: Transaction;

    beforeEach(async () => {
      const newTransactionPayload = {
        description: "Grocery Shopping",
        amount: 50,
        from_account_id: account.id,
        type: "expense",
        date: new Date().toISOString(),
      } as const;

      transaction = await createTransaction(newTransactionPayload, user);
    });

    test("returns the transaction for given id", async () => {
      const res = await fetcher(
        `/api/transactions/${transaction.id}`,
        {},
        user.session_token
      );

      const body = await res.json();

      expect(res.status).toEqual(200);
      expect(body.status).toEqual("success");

      expect(body.data).toMatchObject(transaction);
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
      const newTransactionPayload = {
        description: "Grocery Shopping",
        amount: 50,
        from_account_id: account.id,
        type: "expense",
        date: new Date().toISOString(),
      } as const;

      await Promise.all(
        Array.from({ length: 5 }, (_, i) =>
          createTransaction(
            {
              ...newTransactionPayload,
              amount: 50 + i * 10,
            },
            user
          )
        )
      );

      const res = await fetcher("/api/transactions", {}, user.session_token);

      const body = await res.json();

      expect(res.status).toEqual(200);
      expect(body.status).toEqual("success");
      expect(body.data).toHaveLength(5);
      body.data.forEach((transaction: Transaction) => {
        expect(transaction.user_id).toEqual(user.id);
      });
    });
  });

  describe("POST /transactions", async () => {
    let categoryExpense: Category;

    beforeEach(async () => {
      const newExpenseCategoryPayload = {
        type: "expense",
        name: "Hola!",
      } as const;

      categoryExpense = await createCategory(newExpenseCategoryPayload, user);
    });

    test("returns validation error for empty body", async () => {
      const res = await fetcher(
        "/api/transactions",
        {
          method: "POST",
        },
        user.session_token
      );

      const body = await res.json();

      expect(res.status).toEqual(400);
      expect(body.status).toEqual("fail");
      expect(body.data).toHaveProperty("type");
      expect(body.data).toHaveProperty("amount");
      expect(body.data).toHaveProperty("date");
      expect(body.data).toHaveProperty("description");
    });

    test("returns validation error for invalid data", async () => {
      const newTransactionPayload = {
        amount: 50,
        from_account_id: account.id,
        type: "expense",
        date: "invalid-date",
      } as const;

      const res = await fetcher(
        "/api/transactions",
        {
          method: "POST",
          body: JSON.stringify(newTransactionPayload),
        },
        user.session_token
      );

      const body = await res.json();

      expect(res.status).toEqual(400);
      expect(body.status).toEqual("fail");
      expect(body.data).toHaveProperty("date");
      expect(body.data).toHaveProperty("description");
    });

    test.each([
      ["to_account_id", "expense"],
      ["from_account_id", "income"],
    ])(
      "returns validation error when %s is combined with type %s",
      async (key, type) => {
        const newTransactionPayload = {
          amount: 50,
          description: "Test Transaction",
          date: new Date().toISOString(),
          [key]: account.id,
          type,
        } as const;

        const res = await fetcher(
          "/api/transactions",
          {
            method: "POST",
            body: JSON.stringify(newTransactionPayload),
          },
          user.session_token
        );

        const body = await res.json();

        expect(res.status).toEqual(400);
        expect(body.status).toEqual("fail");
        expect(body.data).toHaveProperty("to_account_id");
      }
    );

    test("returns validation error when transfer from and to accounts are the same", async () => {
      const newTransactionPayload = {
        description: "Grocery Shopping",
        amount: 50,
        to_account_id: account.id,
        from_account_id: account.id,
        type: "transfer",
        date: new Date().toISOString(),
        category_id: categoryExpense.id,
      } as const;

      const res = await fetcher(
        "/api/transactions",
        {
          method: "POST",
          body: JSON.stringify(newTransactionPayload),
        },
        user.session_token
      );

      const body = await res.json();

      expect(res.status).toEqual(400);
      expect(body.status).toEqual("fail");
      expect(body.data).toHaveProperty("to_account_id");
    });

    test("creates transaction with valid data (with category)", async () => {
      const newTransactionPayload = {
        description: "Grocery Shopping",
        amount: 50,
        from_account_id: account.id,
        type: "expense",
        date: new Date().toISOString(),
        category_id: categoryExpense.id,
      } as const;

      const transaction = await createTransaction(newTransactionPayload, user);

      const { category_id, ...expectedTransaction } = newTransactionPayload;

      expect(transaction).toHaveProperty("id");
      expect(transaction).toMatchObject({
        ...expectedTransaction,
        date: expectedTransaction.date,
      });

      const transactionCategoryLink = await db
        .selectFrom("transaction_category")
        .where("transaction_id", "=", transaction.id)
        .selectAll()
        .execute();

      expect(transactionCategoryLink).toHaveLength(1);
      expect(transactionCategoryLink[0].category_id).toEqual(
        categoryExpense.id
      );
    });

    describe("Account Balance Updates", () => {
      let account1: FinancialAccount;
      let account2: FinancialAccount;

      beforeEach(async () => {
        account1 = await createAccount(
          {
            name: "Account 1",
            initial_balance: 1000,
            type: "bank",
            currency: "EUR",
          },
          user
        );
        account2 = await createAccount(
          {
            name: "Account 2",
            initial_balance: 1000,
            type: "bank",
            currency: "EUR",
          },
          user
        );
      });

      test("updates account balance correctly for income transaction", async () => {
        const balancesBefore = await getFinancialAccountBalances(account1.id);

        const newTransactionPayload = {
          description: "Grocery Shopping",
          amount: 250,
          to_account_id: account1.id,
          type: "income",
          date: new Date().toISOString(),
        } as const;

        await createTransaction(newTransactionPayload, user);
        const balancesAfter = await getFinancialAccountBalances(account1.id);

        expect(balancesAfter?.balance).toEqual(balancesBefore?.balance + 250);
      });

      test("updates account balance correctly for expense transaction", async () => {
        const balancesBefore = await getFinancialAccountBalances(account1.id);

        const newTransactionPayload = {
          description: "Grocery Shopping",
          amount: 250,
          from_account_id: account1.id,
          type: "expense",
          date: new Date().toISOString(),
        } as const;

        await createTransaction(newTransactionPayload, user);
        const balancesAfter = await getFinancialAccountBalances(account1.id);

        expect(balancesAfter?.balance).toEqual(balancesBefore?.balance - 250);
      });

      test("updates account balances correctly for transfer transaction", async () => {
        const fromBefore = await getFinancialAccountBalances(account1.id);
        const toBefore = await getFinancialAccountBalances(account2.id);

        const newTransactionPayload = {
          description: "Grocery Shopping",
          amount: 99.99,
          from_account_id: account1.id,
          to_account_id: account2.id,
          type: "transfer",
          date: new Date().toISOString(),
        } as const;

        await createTransaction(newTransactionPayload, user);

        const fromAfter = await getFinancialAccountBalances(account1.id);
        const toAfter = await getFinancialAccountBalances(account2.id);

        expect(fromAfter?.balance).toEqual(fromBefore?.balance - 99.99);
        expect(toAfter?.balance).toEqual(toBefore?.balance + 99.99);
      });

      test("does not update balance for zero-amount transaction", async () => {
        const balancesBefore = await getFinancialAccountBalances(account1.id);

        const newTransactionPayload = {
          description: "Grocery Shopping",
          amount: 0,
          from_account_id: account1.id,
          type: "expense",
          date: new Date().toISOString(),
        } as const;

        await createTransaction(newTransactionPayload, user);
        const balancesAfter = await getFinancialAccountBalances(account1.id);
        expect(balancesAfter?.balance).toEqual(balancesBefore?.balance);
      });
    });
  });

  describe("PUT /transactions/:id", () => {
    let transaction1: Transaction;
    let transaction2: Transaction;
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

      const newTransactionPayload = {
        description: "Grocery Shopping",
        amount: 50,
        from_account_id: account.id,
        type: "expense",
        date: new Date().toISOString(),
      } as const;

      transaction1 = await createTransaction(newTransactionPayload, user);
      transaction2 = await createTransaction(
        { ...newTransactionPayload, amount: 100, category_id: category1.id },
        user
      );
    });

    describe("Category Link Management", () => {
      test("adds category link", async () => {
        const transactionBefore = await getTransaction(transaction1.id);
        await expectCategoryLink(transaction1.id, null);

        const { status, body } = await updateTransaction(
          transaction1.id,
          {
            amount: 100,
            description: "I was just updated!",
            category_id: category1.id,
          },
          user.session_token
        );

        expect(status).toEqual(200);
        expect(body.status).toEqual("success");

        await expectCategoryLink(transaction1.id, category1.id);
        const transactionAfter = await getTransaction(transaction1.id);
        expect(transactionAfter).not.toMatchObject(transactionBefore!);
      });

      test("updates category link", async () => {
        await expectCategoryLink(transaction2.id, category1.id);
        const { status, body } = await updateTransaction(
          transaction2.id,
          {
            amount: 100,
            description: "I was just updated!",
            category_id: category2.id,
          },
          user.session_token
        );
        expect(status).toEqual(200);
        expect(body.status).toEqual("success");
        await expectCategoryLink(transaction2.id, category2.id);
      });

      test("removes category link", async () => {
        await expectCategoryLink(transaction2.id, category1.id);
        const { status, body } = await updateTransaction(
          transaction2.id,
          { category_id: null },
          user.session_token
        );
        expect(status).toEqual(200);
        expect(body.status).toEqual("success");
        await expectCategoryLink(transaction2.id, null);
      });

      test("rejects mismatched category type", async () => {
        const { status, body } = await updateTransaction(
          transaction1.id,
          { category_id: category3.id },
          user.session_token
        );
        expect(status).toEqual(400);
        expect(body.status).toEqual("fail");
        expect(body.data).toHaveProperty("category_id");
        expect(body.data.category_id).toEqual(
          "Category type does not match transaction type"
        );
        await expectCategoryLink(transaction1.id, null);
      });

      test("rejects non-existent category_id", async () => {
        const fakeCategoryId = "00000000-0000-0000-0000-000000000000";
        const { status, body } = await updateTransaction(
          transaction1.id,
          { category_id: fakeCategoryId },
          user.session_token
        );
        expect(status).toEqual(404);
        expect(body.status).toEqual("error");
        expect(body.message).toEqual(
          `Category with id ${fakeCategoryId} not found`
        );
        await expectCategoryLink(transaction1.id, null);
      });
    });

    describe("General Update & Validation", () => {
      test("updates amount and description only (no category)", async () => {
        // Transaction[0] has no category
        const transactionBefore = await getTransaction(transaction1.id);
        await expectCategoryLink(transaction1.id, null);

        const { status, body } = await updateTransaction(
          transaction1.id,
          {
            amount: transactionBefore!.amount + 10,
            description: "Updated description only",
          },
          user.session_token
        );

        expect(status).toEqual(200);
        expect(body.status).toEqual("success");

        const transactionAfter = await getTransaction(transaction1.id);
        expect(transactionAfter!.amount).toEqual(
          transactionBefore!.amount + 10
        );
        expect(transactionAfter!.description).toEqual(
          "Updated description only"
        );
        // Category link should remain absent
        await expectCategoryLink(transaction1.id, null);
      });

      test("sending empty body results in no changes", async () => {
        const transactionBefore = await getTransaction(transaction1.id);
        const { status, body } = await updateTransaction(
          transaction1.id,
          undefined,
          user.session_token
        );
        expect(status).toEqual(200);
        expect(body.status).toEqual("success");
        const transactionAfter = await getTransaction(transaction1.id);
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
          `/api/transactions/${transaction1.id}`,
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
    });
  });

  describe("DELETE /transactions/:id", () => {
    let transaction: Transaction;

    beforeEach(async () => {
      const newTransactionPayload = {
        description: "Grocery Shopping",
        amount: 50,
        from_account_id: account.id,
        type: "expense",
        date: new Date().toISOString(),
      } as const;

      transaction = await createTransaction(newTransactionPayload, user);
    });

    test("deletes transaction", async () => {
      const transactionBefore = await getTransaction(transaction.id);
      expect(transactionBefore).toBeDefined();

      const res = await fetcher(
        `/api/transactions/${transaction.id}`,
        {
          method: "DELETE",
        },
        user.session_token
      );

      const body = await res.json();

      expect(res.status).toEqual(200);
      expect(body.status).toEqual("success");
      expect(body.data).toEqual(
        `Transaction with id ${transaction.id} deleted`
      );

      const transactionAfter = await getTransaction(transaction.id);
      expect(transactionAfter).toBeUndefined();
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
