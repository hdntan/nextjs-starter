// ONLY import this file in RSC / Server Actions / Route Handlers
import { auth } from '@/lib/auth'
import { buildApiClient } from './builder'
import { env } from '@/config/env'
import type { ApiClient } from './types'

export async function createServerApiClient(): Promise<ApiClient> {
  const session = await auth()
  const token = session?.user?.accessToken
  return buildApiClient({ token, baseUrl: env.API_URL })
}
