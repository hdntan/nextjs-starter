'use client'

import { SessionProvider as NextAuthSessionProvider, useSession } from 'next-auth/react'
import { useEffect } from 'react'
import { useAuthStore } from '@/store/auth.store'

function AuthSyncProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()
  const setAccessToken = useAuthStore((s) => s.setAccessToken)
  const clearAccessToken = useAuthStore((s) => s.clearAccessToken)

  useEffect(() => {
    if (session?.user?.accessToken) {
      setAccessToken(session.user.accessToken)
    } else {
      clearAccessToken()
    }
  }, [session, setAccessToken, clearAccessToken])

  return <>{children}</>
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextAuthSessionProvider>
      <AuthSyncProvider>{children}</AuthSyncProvider>
    </NextAuthSessionProvider>
  )
}
