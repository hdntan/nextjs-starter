// ONLY import this file in RSC / Server Actions / Route Handlers.
// Reads the session_token HttpOnly cookie and injects it as a Bearer token
// for direct calls to the external API (no proxy hop needed server-side).
import { cookies } from 'next/headers'
import { buildApiClient } from './builder'
import { env } from '@/config/env'
import type { ApiClient } from './types'

export async function createServerApiClient(): Promise<ApiClient> {
  const cookieStore = await cookies()
  const token = cookieStore.get('session_token')?.value
  return buildApiClient({ token, baseUrl: env.API_URL })
}
