import { fetcher } from "@/test-utils/fetcher.js";
import type { User } from "@/types/db/user1.js";

export type UserWithSessionToken = User & { sessionToken: string };

export async function createTestUser(): Promise<UserWithSessionToken> {
  const response = await fetcher("/api/auth/sign-up/email", {
    method: "POST",
    body: JSON.stringify({
      email: `test+${Date.now()}@example.com`,
      password: "password123",
      name: "Test User",
    }),
  });

  const setCookie = response.headers.get("set-cookie");
  const match = setCookie?.match(/better-auth\.session_token=([^;]+)/);
  const sessionToken = match ? match[1] : undefined;
  const { user } = (await response.json()) as { user: User };

  return { ...user, sessionToken: sessionToken! };
}
