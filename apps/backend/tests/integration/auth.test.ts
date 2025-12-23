import { beforeAll, describe, expect, test } from "vitest";
import { fetcher } from "@/test-utils/fetcher.js";
import { cleanDb } from "@/test-utils/clean-db.js";
import { db } from "@/lib/db.js";
import type { User } from "@/types/db/user.js";

describe("Auth Integration Tests", () => {
  let user: User;
  let sessionToken: string;

  beforeAll(async () => {
    await cleanDb();
  });

  test("should register new user by email and create user in database", async () => {
    const response = await fetcher("/api/auth/sign-up/email", {
      method: "POST",
      body: JSON.stringify({
        email: "test@example.com",
        password: "password123",
        name: "Test User",
      }),
    });

    expect(response.status).toBe(200);

    const body = (await response.json()) as { token: string; user: User };

    const setCookie = response.headers.get("set-cookie");
    const match = setCookie?.match(/better-auth\.session_token=([^;]+)/);
    sessionToken = (match ? match[1] : undefined)!;
    user = body.user;

    expect(body).toHaveProperty("user");
    expect(body.user).toHaveProperty("id");
    expect(body.user.email).toBe("test@example.com");

    const dbUser = await db
      .selectFrom("user")
      .selectAll()
      .where("id", "=", body.user.id)
      .executeTakeFirst();

    expect(dbUser).toBeDefined();
    expect(dbUser?.email).toBe("test@example.com");
    expect(dbUser?.name).toBe("Test User");
  });

  test("should be able to logout", async () => {
    const userSessionBefore = await db
      .selectFrom("session")
      .selectAll()
      .where("user_id", "=", user.id)
      .executeTakeFirst();

    expect(userSessionBefore).toBeDefined();

    const response = await fetcher(
      "/api/auth/sign-out",
      {
        method: "POST",
      },
      sessionToken
    );

    expect(response.status).toBe(200);

    const userSessionAfter = await db
      .selectFrom("session")
      .selectAll()
      .where("user_id", "=", user.id)
      .executeTakeFirst();

    expect(userSessionAfter).toBeUndefined();
  });

  test("should be able to login with email and password", async () => {
    const userSessionBefore = await db
      .selectFrom("session")
      .selectAll()
      .where("user_id", "=", user.id)
      .executeTakeFirst();

    expect(userSessionBefore).toBeUndefined();

    const response = await fetcher("/api/auth/sign-in/email", {
      method: "POST",
      body: JSON.stringify({
        email: "test@example.com",
        password: "password123",
      }),
    });

    expect(response.status).toBe(200);

    const userSessionAfter = await db
      .selectFrom("session")
      .selectAll()
      .where("user_id", "=", user.id)
      .executeTakeFirst();

    expect(userSessionAfter).toBeDefined();
  });
});
