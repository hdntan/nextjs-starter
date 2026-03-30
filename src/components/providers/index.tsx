'use client'

import { AuthProvider } from './auth-provider'
import { SWRProvider } from './swr-provider'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <SWRProvider>{children}</SWRProvider>
    </AuthProvider>
  )
}
