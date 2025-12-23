import React, { createContext, useContext } from 'react'
import type { AuthUser } from '@/lib/auth-client'
import { authClient } from '@/lib/auth-client'

export interface AuthState {
  user: AuthUser | null
}

const AuthContext = createContext<AuthState | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data } = authClient.useSession()

  const user = data?.user ?? null

  return (
    <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}
