import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { env } from '@/config/env'
import {
  ACCESS_TOKEN,
  REFRESH_TOKEN,
  ACCESS_COOKIE_OPTIONS,
  REFRESH_COOKIE_OPTIONS,
} from '@/lib/auth/constants'
import type { User } from '@/types/auth'

export async function POST(): Promise<NextResponse> {
  const cookieStore = await cookies()
  const refreshToken = cookieStore.get(REFRESH_TOKEN)?.value

  if (!refreshToken) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  // TODO: Replace /auth/refresh with your actual backend endpoint path
  const res = await fetch(`${env.API_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  }).catch(() => null)

  if (!res || !res.ok) {
    // Refresh token is invalid or expired — clear all auth cookies
    cookieStore.delete(ACCESS_TOKEN)
    cookieStore.delete(REFRESH_TOKEN)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  // TODO: Adjust field names to match your backend's response contract
  const data = (await res.json()) as {
    accessToken: string
    refreshToken: string
    user: User
  }

  cookieStore.set(ACCESS_TOKEN, data.accessToken, ACCESS_COOKIE_OPTIONS)
  cookieStore.set(REFRESH_TOKEN, data.refreshToken, REFRESH_COOKIE_OPTIONS)

  return NextResponse.json({ user: data.user })
}
