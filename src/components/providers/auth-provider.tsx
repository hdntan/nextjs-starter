'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/store/auth.store'
import type { User } from '@/types/auth'

// Hydrates the Zustand auth store from the server session on mount.
// Sets isHydrated=true after the check completes (regardless of auth state)
// so consumers can distinguish "not yet checked" from "confirmed unauthenticated".
function AuthInitializer({ children }: { children: React.ReactNode }) {
  const setUser = useAuthStore((s) => s.setUser)
  const setHydrated = useAuthStore((s) => s.setHydrated)

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { user: User } | null) => {
        if (data?.user) setUser(data.user)
      })
      .catch(() => {
        // No active session — store stays as null
      })
      .finally(() => {
        setHydrated()
      })
  }, [setUser, setHydrated])

  return <>{children}</>
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return <AuthInitializer>{children}</AuthInitializer>
}
