import { netFetch } from '@/lib/net/net'
import type { ApiClient } from './types'

interface BuildApiClientOptions {
  token?: string
  baseUrl: string
}

export function buildApiClient(options: BuildApiClientOptions): ApiClient {
  const { token, baseUrl } = options

  return {
    get: <T>(path: string) => netFetch<T>(`${baseUrl}${path}`, { method: 'GET' }, { token }),

    post: <T>(path: string, body?: unknown) =>
      netFetch<T>(
        `${baseUrl}${path}`,
        {
          method: 'POST',
          body: body !== undefined && body !== null ? JSON.stringify(body) : undefined,
        },
        { token }
      ),

    put: <T>(path: string, body?: unknown) =>
      netFetch<T>(
        `${baseUrl}${path}`,
        {
          method: 'PUT',
          body: body !== undefined && body !== null ? JSON.stringify(body) : undefined,
        },
        { token }
      ),

    delete: <T>(path: string) => netFetch<T>(`${baseUrl}${path}`, { method: 'DELETE' }, { token }),
  }
}
