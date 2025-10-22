import type { UserWithSessionToken } from "@test-utils/create-test-user.js";

const BASE_URL = "http://localhost:3000";

export async function fetcher(
  input: string | URL | Request,
  init?: RequestInit,
  session_token?: UserWithSessionToken["session_token"]
) {
  return fetch(`${BASE_URL}${input}`, {
    ...init,
    headers: {
      ...init?.headers,
      Cookie: `better-auth.session_token=${session_token}`,
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
    },
  });
}
