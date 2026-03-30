'use client'

import { useAuthStore } from '@/store/auth.store'
import type { User } from '@/types/auth'

export function useAuth() {
  const user = useAuthStore((s) => s.user)
  const isHydrated = useAuthStore((s) => s.isHydrated)
  const setUser = useAuthStore((s) => s.setUser)
  const clearUser = useAuthStore((s) => s.clearUser)

  async function login(email: string, password: string): Promise<User> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: 'Login failed' }))
      throw new Error(error.message ?? 'Login failed')
    }

    const data = (await res.json()) as { user: User }
    setUser(data.user)
    return data.user
  }

  async function logout(): Promise<void> {
    const res = await fetch('/api/auth/logout', { method: 'POST' })
    if (!res.ok) throw new Error('Logout failed')
    clearUser()
  }

  return {
    user,
    isAuthenticated: user !== null,
    isHydrated,
    login,
    logout,
  }
}
