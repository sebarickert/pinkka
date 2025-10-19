import { db } from "@/lib/db.js";
import { cleanDb } from "@/tests/utils/cleanDb.js";
import { createAccount } from "@/tests/utils/createAccount.js";
import { createCategory } from "@/tests/utils/createCategory.js";
import {
  createTestUser,
  type UserWithSessionToken,
} from "@/tests/utils/createTestUser.js";
import { fetcher } from "@/tests/utils/fetcher.js";
import { createTransaction } from "@/tests/utils/transaction.js";
import { beforeEach, describe, expect, test } from "vitest";

describe("Category Integration Tests", () => {
  let user: UserWithSessionToken;

  beforeEach(async () => {
    await cleanDb();
    user = await createTestUser();
  });

  describe("Authorization", () => {
    const protectedEndpoints = [
      { method: "GET", path: "/api/categories" },
      { method: "POST", path: "/api/categories" },
      { method: "GET", path: "/api/categories/some-id" },
      { method: "PUT", path: "/api/categories/some-id" },
      { method: "DELETE", path: "/api/categories/some-id" },
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

  describe("GET /categories/:id", () => {
    let category: any;

    beforeEach(async () => {
      const newCategoryPayload = {
        type: "income",
        name: "Hola!",
      } as const;

      category = await createCategory(newCategoryPayload, user);
    });

    test("returns the category for given id", async () => {
      const res = await fetcher(
        `/api/categories/${category.id}`,
        {},
        user.session_token
      );

      const body = await res.json();

      expect(res.status).toEqual(200);
      expect(body.status).toEqual("success");
      expect(body.data).toMatchObject(category);
    });

    test("returns 404 when category does not exist", async () => {
      const id = "c2b8f3ee-c9ae-4104-8f89-173e3871ebb9";

      const res = await fetcher(
        `/api/categories/${id}`,
        {},
        user.session_token
      );

      const body = await res.json();

      expect(res.status).toEqual(404);
      expect(body.status).toEqual("error");
      expect(body.message).toBe(`Category with id ${id} not found`);
    });

    test("returns validation error if id is not a valid uuid", async () => {
      const res = await fetcher(
        `/api/categories/some-non-existing-id`,
        {},
        user.session_token
      );

      const body = await res.json();

      expect(res.status).toEqual(400);
      expect(body.status).toEqual("error");
      expect(body.message).toBe("Invalid id format");
    });
  });

  describe("GET /categories", () => {
    test("returns empty array when user has no categories", async () => {
      const res = await fetcher("/api/categories", {}, user.session_token);

      const body = await res.json();

      expect(res.status).toEqual(200);
      expect(body.status).toEqual("success");
      expect(body.data).toEqual([]);
    });

    test("returns all categories for user", async () => {
      const newCategories = [
        {
          type: "transfer",
          name: "Hola!",
        },
        {
          type: "income",
          name: "Petty Cash",
        },
      ];

      for (const category of newCategories) {
        await fetcher(
          "/api/categories",
          {
            method: "POST",
            body: JSON.stringify(category),
          },
          user.session_token
        );
      }

      const res = await fetcher("/api/categories", {}, user.session_token);

      const body = await res.json();

      expect(res.status).toEqual(200);
      expect(body.status).toEqual("success");
      expect(body.data).toHaveLength(newCategories.length);

      body.data.forEach(({ user_id }: { user_id: string }) => {
        expect(user_id).toEqual(user.id);
      });
    });
  });

  describe("POST /categories", () => {
    const newCategoryPayload = {
      type: "income",
      name: "Test category",
    };

    test("returns validation errors if required fields are missing", async () => {
      const res = await fetcher(
        "/api/categories",
        {
          method: "POST",
        },
        user.session_token
      );

      const body = await res.json();

      expect(res.status).toEqual(400);
      expect(body.status).toEqual("fail");
      expect(body.data).toHaveProperty("name");
      expect(body.data).toHaveProperty("type");
    });

    test("creates category with valid data", async () => {
      const res = await fetcher(
        "/api/categories",
        {
          method: "POST",
          body: JSON.stringify(newCategoryPayload),
        },
        user.session_token
      );

      const body = await res.json();

      expect(res.status).toEqual(201);
      expect(body.status).toEqual("success");

      const newCategoryId = body.data.id;

      const newCategory = await db
        .selectFrom("category")
        .where("id", "=", newCategoryId)
        .selectAll()
        .executeTakeFirst();

      expect(newCategory).toMatchObject({
        ...newCategoryPayload,
        user_id: user.id,
        is_deleted: false,
      });

      expect(newCategory?.id).toEqual(expect.any(String));
      expect(newCategory?.created_at).toEqual(expect.any(Date));
      expect(newCategory?.updated_at).toEqual(expect.any(Date));
    });
  });

  describe("PUT /categories/:id", () => {
    let category: any;

    beforeEach(async () => {
      const newCategoryPayload = {
        type: "expense",
        name: "Hola!",
      } as const;

      category = await createCategory(newCategoryPayload, user);
    });

    test("updates category with valid data", async () => {
      const categoryBefore = await db
        .selectFrom("category")
        .where("id", "=", category.id)
        .selectAll()
        .executeTakeFirst();

      const res = await fetcher(
        `/api/categories/${category.id}`,
        {
          method: "PUT",
          body: JSON.stringify({
            name: "I was just updated!",
            type: "income",
          }),
        },
        user.session_token
      );

      const body = await res.json();

      expect(res.status).toEqual(200);
      expect(body.status).toEqual("success");

      const categoryAfter = await db
        .selectFrom("category")
        .where("id", "=", category.id)
        .selectAll()
        .executeTakeFirst();

      expect(categoryAfter).not.toMatchObject(categoryBefore!);
    });

    test("sending empty body results in no changes", async () => {
      const categoryBefore = await db
        .selectFrom("category")
        .where("id", "=", category.id)
        .selectAll()
        .executeTakeFirst();

      const res = await fetcher(
        `/api/categories/${category.id}`,
        {
          method: "PUT",
        },
        user.session_token
      );

      const body = await res.json();

      expect(res.status).toEqual(200);
      expect(body.status).toEqual("success");

      const accountAfter = await db
        .selectFrom("category")
        .where("id", "=", category.id)
        .selectAll()
        .executeTakeFirst();

      expect(accountAfter).toMatchObject(categoryBefore!);
    });

    test("returns validation error if id is not a valid uuid", async () => {
      const res = await fetcher(
        `/api/categories/some-non-existing-id`,
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
        `/api/categories/${category.id}`,
        {
          method: "PUT",
          body: JSON.stringify({
            asd: "I was just updated!",
          }),
        },
        user.session_token
      );

      const body = await res.json();

      expect(res.status).toEqual(400);
      expect(body.status).toEqual("fail");
    });

    test("returns 404 when trying to update non-existing category", async () => {
      const id = "c2b8f3ee-c9ae-4104-8f89-173e3871ebb9";

      const res = await fetcher(
        `/api/categories/${id}`,
        {
          method: "PUT",
          body: JSON.stringify({
            name: "I do not exist",
          }),
        },
        user.session_token
      );

      const body = await res.json();

      expect(res.status).toEqual(404);
      expect(body.status).toEqual("error");
      expect(body.message).toBe(`Category with id ${id} not found`);
    });

    test("prevents updating type if category is linked to a transaction", async () => {
      const account = await createAccount(
        {
          name: "Account 1",
          initial_balance: 1000,
          type: "bank",
          currency: "EUR",
        },
        user
      );

      const newTransactionPayload = {
        description: "Grocery Shopping",
        amount: 50,
        from_account_id: account.id,
        type: "expense",
        date: new Date().toISOString(),
        category_id: category.id,
      } as const;

      await createTransaction(newTransactionPayload, user);

      const res = await fetcher(
        `/api/categories/${category.id}`,
        {
          method: "PUT",
          body: JSON.stringify({
            type: "income",
          }),
        },
        user.session_token
      );

      const body = await res.json();

      expect(res.status).toEqual(400);
      expect(body.status).toEqual("fail");
      expect(body.data).toHaveProperty("type");
    });

    test("returns 404 when trying to update deleted category", async () => {
      await fetcher(
        `/api/categories/${category.id}`,
        {
          method: "PUT",
          body: JSON.stringify({
            is_deleted: true,
          }),
        },
        user.session_token
      );

      const res = await fetcher(
        `/api/categories/${category.id}`,
        {
          method: "PUT",
          body: JSON.stringify({
            name: "Trying to update deleted category",
          }),
        },
        user.session_token
      );

      const body = await res.json();

      expect(res.status).toEqual(404);
      expect(body.status).toEqual("error");
      expect(body.message).toBe(`Category with id ${category.id} not found`);
    });
  });

  describe("DELETE /categories/:id", () => {
    let category: any;

    beforeEach(async () => {
      const newCategoryPayload = {
        type: "expense",
        name: "Test category to delete",
      } as const;

      category = await createCategory(newCategoryPayload, user);
    });

    test("soft-deletes the category", async () => {
      const categoryBefore = await db
        .selectFrom("category")
        .where("id", "=", category.id)
        .selectAll()
        .executeTakeFirst();

      expect(categoryBefore?.is_deleted).toEqual(false);

      const res = await fetcher(
        `/api/categories/${category.id}`,
        {
          method: "DELETE",
        },
        user.session_token
      );

      const body = await res.json();

      expect(res.status).toEqual(200);
      expect(body.status).toEqual("success");
      expect(body.data.is_deleted).toEqual(true);

      const categoryAfter = await db
        .selectFrom("category")
        .where("id", "=", category.id)
        .selectAll()
        .executeTakeFirst();

      expect(categoryAfter?.is_deleted).toEqual(true);
    });

    test("returns 404 when trying to delete non-existing category", async () => {
      const id = "c2b8f3ee-c9ae-4104-8f89-173e3871ebb9";

      const res = await fetcher(
        `/api/categories/${id}`,
        {
          method: "DELETE",
        },
        user.session_token
      );

      const body = await res.json();

      expect(res.status).toEqual(404);
      expect(body.status).toEqual("error");
      expect(body.message).toBe(`Category with id ${id} not found`);
    });

    test("returns validation error if id is not a valid uuid", async () => {
      const res = await fetcher(
        `/api/categories/some-non-existing-id`,
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
