// ONLY import this file in RSC / Server Actions / Route Handlers.
// Reads the access_token HttpOnly cookie and injects it as a Bearer token
// for direct calls to the external API (no proxy hop needed server-side).
import { cookies } from 'next/headers'
import { buildApiClient } from './builder'
import { env } from '@/config/env'
import {
  ACCESS_TOKEN,
  REFRESH_TOKEN,
  ACCESS_COOKIE_OPTIONS,
  REFRESH_COOKIE_OPTIONS,
} from '@/lib/auth/constants'
import { isTokenExpired } from '@/lib/auth/jwt'
import type { ApiClient } from './types'

export async function createServerApiClient(): Promise<ApiClient> {
  const cookieStore = await cookies()
  let token = cookieStore.get(ACCESS_TOKEN)?.value

  // Proactive expiry check — avoids a doomed API call if the token is already expired.
  // Refreshes before the call rather than handling a 401 after.
  if (token && isTokenExpired(token)) {
    const refreshToken = cookieStore.get(REFRESH_TOKEN)?.value

    if (refreshToken) {
      try {
        // TODO: Replace /auth/refresh with your actual backend endpoint
        const res = await fetch(`${env.API_URL}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        })

        if (res.ok) {
          const data = (await res.json()) as { accessToken: string; refreshToken: string }
          token = data.accessToken

          // Route Handlers / Server Actions: persist new cookies.
          // RSC (page.tsx): cookies().set() throws — caught below. New token is used
          // in-memory for this render; cookies are refreshed on the next client request.
          try {
            cookieStore.set(ACCESS_TOKEN, data.accessToken, ACCESS_COOKIE_OPTIONS)
            cookieStore.set(REFRESH_TOKEN, data.refreshToken, REFRESH_COOKIE_OPTIONS)
          } catch {
            // RSC context — silently continue with in-memory token
          }
        } else {
          // Refresh rejected — clear stale cookies so subsequent renders skip the retry
          token = undefined
          try {
            cookieStore.delete(ACCESS_TOKEN)
            cookieStore.delete(REFRESH_TOKEN)
          } catch {
            // RSC context — cannot delete cookies; they'll expire naturally
          }
        }
      } catch (err) {
        // Network error during refresh — log and proceed; the API call will surface the error
        console.error('[createServerApiClient] Token refresh failed:', err)
      }
    } else {
      token = undefined // no refresh token; session is exhausted
    }
  }

  return buildApiClient({ token, baseUrl: env.API_URL })
}
