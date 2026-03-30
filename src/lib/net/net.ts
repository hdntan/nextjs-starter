import { generateCorrelationId } from './correlation'
import { CORRELATION_ID_HEADER } from '@/config/constants'
import { AUTH_BYPASS } from '@/config/flags'

export interface NetOptions {
  token?: string
  correlationId?: string
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly correlationId?: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

// ─── Client-side refresh singleton ───────────────────────────────────────────
// Module-level promise prevents concurrent 401s from triggering multiple
// refresh calls (token reuse errors on rotation-enabled backends).
// Only used in browser context (guarded by typeof window check below).

let refreshPromise: Promise<boolean> | null = null

function getOrStartRefresh(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = fetch('/api/auth/refresh', { method: 'POST' })
      .then((res) => res.ok)
      .catch(() => false)
      .finally(() => {
        refreshPromise = null
      })
  }
  return refreshPromise
}

// ─── Core fetch ──────────────────────────────────────────────────────────────

async function netFetchInternal<T>(
  url: string,
  init: RequestInit,
  options: NetOptions,
  isRetry: boolean
): Promise<T> {
  const headers = new Headers(init.headers)

  if (options.token) {
    headers.set('Authorization', `Bearer ${options.token}`)
  }

  headers.set(CORRELATION_ID_HEADER, options.correlationId ?? generateCorrelationId())

  // Only set Content-Type when a body is present (GET/DELETE have no body)
  if (init.body !== undefined && init.body !== null) {
    headers.set('Content-Type', 'application/json')
  }

  const response = await fetch(url, { ...init, headers })

  if (!response.ok) {
    // Client-side 401 intercept: attempt refresh then retry once.
    // Guard: only in browser (server-side refresh is handled in createServerApiClient).
    if (response.status === 401 && !isRetry && typeof window !== 'undefined') {
      const refreshed = await getOrStartRefresh()

      if (refreshed) {
        // Retry original request — new cookies are auto-sent by the browser
        return netFetchInternal<T>(url, init, options, true)
      }

      // Both tokens exhausted — redirect to login (skipped in bypass/guest mode)
      // TODO: RE-ENABLE AUTH — Remove AUTH_BYPASS check to restore redirect on session expiry
      if (!AUTH_BYPASS) window.location.href = '/login'
      throw new ApiError(401, 'Session expired', headers.get(CORRELATION_ID_HEADER) ?? undefined)
    }

    const body = (await response.json().catch(() => ({ message: response.statusText }))) as {
      message?: string
    }
    throw new ApiError(
      response.status,
      body.message ?? response.statusText,
      headers.get(CORRELATION_ID_HEADER) ?? undefined
    )
  }

  return response.json() as Promise<T>
}

export async function netFetch<T>(
  url: string,
  init: RequestInit = {},
  options: NetOptions = {}
): Promise<T> {
  return netFetchInternal<T>(url, init, options, false)
}
