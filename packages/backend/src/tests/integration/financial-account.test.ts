import { db } from "@/lib/db.js";
import { fetcher } from "@/tests/utils/fetcher.js";
import { createTestUser } from "@/tests/utils/createTestUser.js";
import { beforeAll, describe, expect, test } from "vitest";
import { cleanDb } from "@/tests/utils/cleanDb.js";

describe("Financial Account Integration Tests", () => {
  let user: any;
  let jwt: string;

  beforeAll(async () => {
    await cleanDb();
    const auth = await createTestUser();

    user = auth.user;
    jwt = auth.jwt;
  });

  describe("POST /accounts", () => {
    test("should fail to create financial account for unauthenticated user", async () => {
      const res = await fetcher("/api/accounts", {
        method: "POST",
      });

      const body = await res.json();

      expect(res.status).toEqual(401);
      expect(body.status).toEqual("error");
      expect(body.message).toBe("Unauthorized");
    });

    test("should fail to create financial account for authenticated user without required fields", async () => {
      const res = await fetcher(
        "/api/accounts",
        {
          method: "POST",
          body: JSON.stringify({
            user_id: user.id,
            type: "bank",
            currency: "EUR",
            current_balance: 1000,
            pending_balance: 0,
          }),
        },
        jwt
      );

      const body = await res.json();

      expect(res.status).toEqual(400);
      expect(body.status).toEqual("fail");
      expect(body.data).toHaveProperty("name");
    });

    test("should create financial account for authenticated user", async () => {
      const newAccountPayload = {
        user_id: user.id,
        type: "bank",
        name: "Hola!",
        currency: "EUR",
        current_balance: 1000,
        pending_balance: 0,
      };

      const res = await fetcher(
        "/api/accounts",
        {
          method: "POST",
          body: JSON.stringify(newAccountPayload),
        },
        jwt
      );

      const body = await res.json();

      expect(res.status).toEqual(201);
      expect(body.status).toEqual("success");

      const newAccountId = body.data.id;

      const newAccount = await db
        .selectFrom("financial_account")
        .where("id", "=", newAccountId)
        .selectAll()
        .executeTakeFirst();

      expect(newAccount).toMatchObject({
        ...newAccountPayload,
        id: newAccount?.id,
        current_balance: "1000",
        pending_balance: "0",
      });

      expect(newAccount?.is_deleted).toBeDefined();
      expect(newAccount?.created_at).toBeDefined();
      expect(newAccount?.updated_at).toBeDefined();
    });
  });
});
