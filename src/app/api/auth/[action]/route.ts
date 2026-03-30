import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { env } from '@/config/env'
import {
  ACCESS_TOKEN,
  REFRESH_TOKEN,
  ACCESS_COOKIE_OPTIONS,
  REFRESH_COOKIE_OPTIONS,
} from '@/lib/auth/constants'
import type { User } from '@/types/auth'

// ─── Handlers ────────────────────────────────────────────────────────────────

async function handleLogin(request: NextRequest): Promise<NextResponse> {
  let body: { email?: string; password?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ message: 'Invalid request body' }, { status: 400 })
  }

  if (!body.email || !body.password) {
    return NextResponse.json({ message: 'Email and password are required' }, { status: 400 })
  }

  // TODO: Replace /auth/login with your actual backend endpoint path
  const res = await fetch(`${env.API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: body.email, password: body.password }),
  }).catch(() => null)

  if (!res) {
    return NextResponse.json({ message: 'Service unavailable' }, { status: 503 })
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Invalid credentials' }))
    return NextResponse.json(error, { status: res.status })
  }

  // TODO: Adjust field names to match your backend contract
  // Expected: { accessToken: string, refreshToken: string, user: User }
  const data = (await res.json()) as {
    accessToken: string
    refreshToken: string
    user: User
  }

  const cookieStore = await cookies()
  cookieStore.set(ACCESS_TOKEN, data.accessToken, ACCESS_COOKIE_OPTIONS)
  cookieStore.set(REFRESH_TOKEN, data.refreshToken, REFRESH_COOKIE_OPTIONS)

  return NextResponse.json({ user: data.user })
}

async function handleLogout(): Promise<NextResponse> {
  const cookieStore = await cookies()

  // TODO: Optionally call your backend logout endpoint here to invalidate tokens server-side
  // const token = cookieStore.get(ACCESS_TOKEN)?.value
  // if (token) await fetch(`${env.API_URL}/auth/logout`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } })

  cookieStore.delete(ACCESS_TOKEN)
  cookieStore.delete(REFRESH_TOKEN)
  return NextResponse.json({ success: true })
}

async function handleMe(): Promise<NextResponse> {
  const cookieStore = await cookies()
  const token = cookieStore.get(ACCESS_TOKEN)?.value

  if (!token) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  // TODO: Replace /auth/me with your actual backend endpoint.
  // Alternative: decode the JWT locally to avoid the extra network hop.
  const res = await fetch(`${env.API_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  }).catch(() => null)

  if (!res || !res.ok) {
    // On 401: clear the expired access_token but KEEP the refresh_token so the
    // client can call /api/auth/refresh to obtain a new access_token.
    // On transient errors (503, 429): clear nothing — don't log the user out.
    if (res?.status === 401) {
      cookieStore.delete(ACCESS_TOKEN)
    }
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const user = (await res.json()) as User
  return NextResponse.json({ user })
}

// ─── Route Exports ────────────────────────────────────────────────────────────

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ action: string }> }
): Promise<NextResponse> {
  const { action } = await params

  switch (action) {
    case 'me':
      return handleMe()
    default:
      return NextResponse.json({ message: 'Not found' }, { status: 404 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ action: string }> }
): Promise<NextResponse> {
  const { action } = await params

  switch (action) {
    case 'login':
      return handleLogin(request)
    case 'logout':
      return handleLogout()
    default:
      return NextResponse.json({ message: 'Not found' }, { status: 404 })
  }
}
