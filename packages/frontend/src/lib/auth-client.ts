import { adminClient } from 'better-auth/client/plugins'
// Import {BACKEND_URL} from './env.ts';
import { createAuthClient } from 'better-auth/react'

export type AuthUser = typeof authClient.$Infer.Session.user
export type AuthSession = typeof authClient.$Infer.Session.session

export const authClient = createAuthClient({
  // BaseURL: BACKEND_URL,
  baseURL: 'http://localhost:3000',
  plugins: [adminClient()],
})
