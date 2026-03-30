'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/store/auth.store'
import type { User } from '@/types/auth'

// Hydrates the Zustand auth store from the server session on mount.
// Sets isHydrated=true after the check completes (regardless of auth state)
// so consumers can distinguish "not yet checked" from "confirmed unauthenticated".
//
// Refresh flow: if /api/auth/me returns 401 (expired access_token), attempt
// POST /api/auth/refresh once. On success, retry /api/auth/me with the new token.
function AuthInitializer({ children }: { children: React.ReactNode }) {
  const setUser = useAuthStore((s) => s.setUser)
  const setHydrated = useAuthStore((s) => s.setHydrated)

  useEffect(() => {
    async function hydrateUser() {
      try {
        const res = await fetch('/api/auth/me')

        if (res.ok) {
          const data = (await res.json()) as { user: User }
          if (data.user) setUser(data.user)
          return
        }

        // On 401: access_token is expired — attempt one refresh before giving up
        if (res.status === 401) {
          const refreshRes = await fetch('/api/auth/refresh', { method: 'POST' })
          if (refreshRes.ok) {
            const retryRes = await fetch('/api/auth/me')
            if (retryRes.ok) {
              const data = (await retryRes.json()) as { user: User }
              if (data.user) setUser(data.user)
            }
          }
          // If refresh failed, store stays null — user will be redirected by middleware
        }
      } catch {
        // Network error — store stays as null
      } finally {
        setHydrated()
      }
    }

    void hydrateUser()
  }, [setUser, setHydrated])

  return <>{children}</>
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return <AuthInitializer>{children}</AuthInitializer>
}
