import { fetcher } from "@/tests/utils/fetcher.js";

export async function createTestUser() {
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
  const jwt = match ? match[1] : undefined;
  const user = (await res.json()).user;

  return { jwt: jwt as string, user };
}
