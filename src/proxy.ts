import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { SESSION_COOKIE } from '@/lib/auth/constants'

export function proxy(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  // Protect all routes except public ones (login, API routes, Next.js internals, static assets)
  matcher: ['/((?!login|api|_next/static|_next/image|favicon.ico).*)'],
}
