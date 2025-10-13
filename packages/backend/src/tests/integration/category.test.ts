import { db } from "@/lib/db.js";
import { cleanDb } from "@/tests/utils/cleanDb.js";
import { createTestUser } from "@/tests/utils/createTestUser.js";
import { fetcher } from "@/tests/utils/fetcher.js";
import { beforeAll, describe, expect, test } from "vitest";

const createCategory = async (newCategoryPayload: any, jwt: string) => {
  const res = await fetcher(
    "/api/categories",
    {
      method: "POST",
      body: JSON.stringify(newCategoryPayload),
    },
    jwt
  );

  const body = await res.json();

  return body.data;
};

describe("Category Integration Tests", () => {
  let user1: any;
  let jwt1: string;
  let user2: any;
  let jwt2: string;

  beforeAll(async () => {
    await cleanDb();
    const auth = await createTestUser();
    const auth2 = await createTestUser();

    user1 = auth.user;
    jwt1 = auth.jwt;
    user2 = auth2.user;
    jwt2 = auth2.jwt;
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

    beforeAll(async () => {
      const newCategoryPayload = {
        type: "income",
        name: "Hola!",
      };

      category = await createCategory(newCategoryPayload, jwt1);
    });

    test("returns the category for given id", async () => {
      const res = await fetcher(`/api/categories/${category.id}`, {}, jwt1);

      const body = await res.json();

      expect(res.status).toEqual(200);
      expect(body.status).toEqual("success");
      expect(body.data).toMatchObject(category);
    });

    test("returns 404 when category does not exist", async () => {
      const id = "c2b8f3ee-c9ae-4104-8f89-173e3871ebb9";

      const res = await fetcher(`/api/categories/${id}`, {}, jwt1);

      const body = await res.json();

      expect(res.status).toEqual(404);
      expect(body.status).toEqual("error");
      expect(body.message).toBe(`Category with id ${id} not found`);
    });

    test("returns validation error if id is not a valid uuid", async () => {
      const res = await fetcher(
        `/api/categories/some-non-existing-id`,
        {},
        jwt1
      );

      const body = await res.json();

      expect(res.status).toEqual(400);
      expect(body.status).toEqual("error");
      expect(body.message).toBe("Invalid id format");
    });
  });

  describe("GET /categories", () => {
    test("returns empty array when user has no categories", async () => {
      const res = await fetcher("/api/categories", {}, jwt2);

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
          jwt2
        );
      }

      const res = await fetcher("/api/categories", {}, jwt2);

      const body = await res.json();

      expect(res.status).toEqual(200);
      expect(body.status).toEqual("success");
      expect(body.data).toHaveLength(newCategories.length);

      body.data.forEach((account: any) => {
        expect(account.user_id).toEqual(user2.id);
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
        jwt1
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
        jwt1
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
        user_id: user1.id,
        is_deleted: false,
      });

      expect(newCategory?.id).toEqual(expect.any(String));
      expect(newCategory?.created_at).toEqual(expect.any(Date));
      expect(newCategory?.updated_at).toEqual(expect.any(Date));
    });
  });

  describe("PUT /categories/:id", () => {
    let category: any;

    beforeAll(async () => {
      const newCategoryPayload = {
        type: "transfer",
        name: "Hola!",
      };

      category = await createCategory(newCategoryPayload, jwt1);
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
        jwt1
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
        jwt1
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
        jwt1
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
        jwt1
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
        jwt1
      );

      const body = await res.json();

      expect(res.status).toEqual(404);
      expect(body.status).toEqual("error");
      expect(body.message).toBe(`Category with id ${id} not found`);
    });

    // TODO: Implement this test when transactions are implemented
    test.skip("prevents updating type if category is linked to a transaction", async () => {});

    test("returns 404 when trying to update deleted category", async () => {
      await fetcher(
        `/api/categories/${category.id}`,
        {
          method: "PUT",
          body: JSON.stringify({
            is_deleted: true,
          }),
        },
        jwt1
      );

      const res = await fetcher(
        `/api/categories/${category.id}`,
        {
          method: "PUT",
          body: JSON.stringify({
            name: "Trying to update deleted category",
          }),
        },
        jwt1
      );

      const body = await res.json();

      expect(res.status).toEqual(404);
      expect(body.status).toEqual("error");
      expect(body.message).toBe(`Category with id ${category.id} not found`);
    });
  });

  describe("DELETE /categories/:id", () => {
    let category: any;

    beforeAll(async () => {
      const newCategoryPayload = {
        type: "expense",
        name: "Test category to delete",
      };

      category = await createCategory(newCategoryPayload, jwt1);
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
        jwt1
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
        jwt1
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
        jwt1
      );

      const body = await res.json();

      expect(res.status).toEqual(400);
      expect(body.status).toEqual("error");
      expect(body.message).toBe("Invalid id format");
    });
  });
});
