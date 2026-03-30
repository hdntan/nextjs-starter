import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { env } from '@/config/env'
import { SESSION_COOKIE } from '@/lib/auth/constants'
import type { User } from '@/types/auth'

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 60 * 60 * 24 * 7, // 7 days
}

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

  // Expected response: { token: string, user: User }
  // TODO: Adjust field names to match your backend contract
  const data = (await res.json()) as { token: string; user: User }

  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, data.token, COOKIE_OPTIONS)

  return NextResponse.json({ user: data.user })
}

async function handleLogout(): Promise<NextResponse> {
  const cookieStore = await cookies()

  // TODO: Optionally call your backend logout endpoint here to invalidate the token server-side
  // await fetch(`${env.API_URL}/auth/logout`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } })

  cookieStore.delete(SESSION_COOKIE)
  return NextResponse.json({ success: true })
}

async function handleMe(): Promise<NextResponse> {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value

  if (!token) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  // TODO: Replace /auth/me with your actual backend endpoint.
  // Alternative: decode the JWT locally to avoid an extra network hop.
  const res = await fetch(`${env.API_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  }).catch(() => null)

  if (!res || !res.ok) {
    // Token may be expired — clear it so the proxy redirects to login
    cookieStore.delete(SESSION_COOKIE)
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
