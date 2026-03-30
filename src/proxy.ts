import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { ACCESS_TOKEN } from '@/lib/auth/constants'

export function proxy(request: NextRequest) {
  // TODO: RE-ENABLE AUTH — Delete the next two lines to restore mandatory login
  const AUTH_BYPASS = true // DEV ONLY: allows unauthenticated access to all routes
  if (AUTH_BYPASS) return NextResponse.next()

  const token = request.cookies.get(ACCESS_TOKEN)

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  // Protect all routes except public ones (login, API routes, Next.js internals, static assets)
  matcher: ['/((?!login|api|_next/static|_next/image|favicon.ico).*)'],
}
