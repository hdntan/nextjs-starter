export { auth as proxy } from '@/lib/auth'

export const config = {
  // Protect all routes except public ones (login, API, Next.js internals, static assets)
  matcher: ['/((?!login|api|_next/static|_next/image|favicon.ico).*)'],
}
