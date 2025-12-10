import { adminClient } from 'better-auth/client/plugins'
import { createAuthClient } from 'better-auth/react'
import { BACKEND_URL } from '@/lib/env'

export type AuthUser = typeof authClient.$Infer.Session.user
export type AuthSession = typeof authClient.$Infer.Session.session

export const authClient = createAuthClient({
  baseURL: BACKEND_URL,
  plugins: [adminClient()],
})
