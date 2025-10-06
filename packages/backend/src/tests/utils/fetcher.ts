const BASE_URL = "http://localhost:3000";

export async function fetcher(
  input: string | URL | Request,
  init?: RequestInit,
  jwt?: string
) {
  return fetch(`${BASE_URL}${input}`, {
    ...init,
    headers: {
      ...init?.headers,
      Cookie: `better-auth.session_token=${jwt}`,
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
    },
  });
}
