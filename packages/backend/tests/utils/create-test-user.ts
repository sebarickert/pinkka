import type { User } from "@/types/db/User.js";
import { fetcher } from "@test-utils/fetcher.js";

export type UserWithSessionToken = User & { session_token: string };

export async function createTestUser(): Promise<UserWithSessionToken> {
  const res = await fetcher("/api/auth/sign-up/email", {
    method: "POST",
    body: JSON.stringify({
      email: `test+${Date.now()}@example.com`,
      password: "password123",
      name: "Test User",
    }),
  });

  const setCookie = res.headers.get("set-cookie");
  const match = setCookie?.match(/better-auth\.session_token=([^;]+)/);
  const session_token = match ? match[1] : undefined;
  const user = (await res.json()).user;

  return { ...user, session_token };
}
