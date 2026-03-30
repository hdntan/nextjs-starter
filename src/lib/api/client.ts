// ONLY import this file in 'use client' components.
// The client calls the BFF proxy (/api/proxy/*) — the proxy handles auth server-side.
// No token is needed here; the HttpOnly access_token cookie is sent automatically
// by the browser on same-origin requests.
import { buildApiClient } from './builder'
import type { ApiClient } from './types'

export function createClientApiClient(): ApiClient {
  return buildApiClient({ baseUrl: '/api/proxy' })
}
