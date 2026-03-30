import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { ACCESS_TOKEN } from '@/lib/auth/constants'
import { AUTH_BYPASS } from '@/config/flags'

export function proxy(request: NextRequest) {
  // TODO: RE-ENABLE AUTH — Set AUTH_BYPASS=false in src/config/flags.ts to restore mandatory login
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
