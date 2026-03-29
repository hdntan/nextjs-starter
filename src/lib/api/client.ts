// ONLY import this file in 'use client' components
import { useAuthStore } from '@/store/auth.store'
import { buildApiClient } from './builder'
import type { ApiClient } from './types'

function getClientBaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_API_URL
  if (!url) throw new Error('NEXT_PUBLIC_API_URL is not set')
  return url
}

export function createClientApiClient(): ApiClient {
  const token = useAuthStore.getState().accessToken ?? undefined
  return buildApiClient({ token, baseUrl: getClientBaseUrl() })
}
