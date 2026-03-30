import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { env } from '@/config/env'
import { SESSION_COOKIE } from '@/lib/auth/constants'

type RouteContext = { params: Promise<{ path: string[] }> }

/** Reject path segments that attempt directory traversal */
function isSafePath(segments: string[]): boolean {
  return segments.every((seg) => seg !== '..' && seg !== '.' && !seg.includes('/'))
}

async function proxyRequest(request: NextRequest, context: RouteContext): Promise<NextResponse> {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value

  if (!token) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const { path } = await context.params

  if (!isSafePath(path)) {
    return NextResponse.json({ message: 'Bad request' }, { status: 400 })
  }

  const targetUrl = `${env.API_URL}/${path.join('/')}`

  // Verify the assembled URL stays within the configured API origin (SSRF guard)
  try {
    const base = new URL(env.API_URL)
    const target = new URL(targetUrl)
    if (target.origin !== base.origin) {
      return NextResponse.json({ message: 'Bad request' }, { status: 400 })
    }
  } catch {
    return NextResponse.json({ message: 'Bad request' }, { status: 400 })
  }

  // Forward query string if present
  const { search } = new URL(request.url)
  const url = search ? `${targetUrl}${search}` : targetUrl

  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
  }

  // Forward Content-Type only when present — don't assume JSON for every request
  const contentType = request.headers.get('Content-Type')
  if (contentType) headers['Content-Type'] = contentType

  const init: RequestInit = {
    method: request.method,
    headers,
  }

  if (request.method !== 'GET' && request.method !== 'HEAD') {
    const text = await request.text()
    if (text) init.body = text
  }

  const res = await fetch(url, init).catch(() => null)

  if (!res) {
    return NextResponse.json({ message: 'Service unavailable' }, { status: 503 })
  }

  const data = await res.json().catch(() => null)
  return NextResponse.json(data ?? {}, { status: res.status })
}

export const GET = proxyRequest
export const POST = proxyRequest
export const PUT = proxyRequest
export const PATCH = proxyRequest
export const DELETE = proxyRequest
