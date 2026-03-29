'use client'

import { SWRConfig } from 'swr'
import { createClientApiClient } from '@/lib/api/client'

function swrFetcher<T>(path: string): Promise<T> {
  const api = createClientApiClient()
  return api.get<T>(path)
}

export function SWRProvider({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig
      value={{
        fetcher: swrFetcher,
        revalidateOnFocus: false,
        revalidateOnReconnect: true,
        errorRetryCount: 3,
        dedupingInterval: 2000,
      }}
    >
      {children}
    </SWRConfig>
  )
}
