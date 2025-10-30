import { createAuthClient } from "better-auth/client";
import { adminClient } from "better-auth/client/plugins";
// Import {BACKEND_URL} from './env.ts';

export const authClient = createAuthClient({
  // BaseURL: BACKEND_URL,
  baseURL: "http://localhost:3000",
  plugins: [adminClient()],
});
