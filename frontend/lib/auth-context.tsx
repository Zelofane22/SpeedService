'use client'

import { createContext, useContext } from 'react'

export type AuthUser = {
  id: string
  name: string
  email: string
  phone: string
  role: string
}

type AuthContextValue = {
  user: AuthUser
  setUser: (user: AuthUser) => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuthUser(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuthUser must be used inside DashboardLayout')
  return ctx
}
