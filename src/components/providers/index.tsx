'use client'

import { SessionProvider } from './session-provider'
import { SWRProvider } from './swr-provider'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <SWRProvider>{children}</SWRProvider>
    </SessionProvider>
  )
}
