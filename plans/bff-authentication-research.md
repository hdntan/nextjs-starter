# Research Report: Next.js 16 BFF Authentication Pattern

**Date:** 2026-03-30 | **Version:** Next.js 16.2.1+ | **Status:** Final

## Executive Summary

Next.js 16 enforces **async-first** cookie operations and introduces **middleware → proxy** migration. Key breaking changes: `cookies()` is async (must `await`), dynamic route `params` are now Promises, and `proxy.ts` replaces `middleware.ts` (Node.js runtime only, edge runtime deprecated). BFF pattern demands HttpOnly + Secure + SameSite=Lax for session tokens, with session validation via local JWT decode or `/me` API call.

---

## Key Findings

### 1. HttpOnly Cookie Management in Route Handlers

**Async Pattern (Next.js 16):**

```tsx
// app/api/auth/login/route.ts
import { cookies } from 'next/headers'

export async function POST(req: Request) {
  const cookieStore = await cookies()

  // Set HttpOnly, Secure, SameSite session token
  cookieStore.set({
    name: 'session',
    value: 'jwt-token-here',
    httpOnly: true, // Prevent XSS access
    secure: true, // HTTPS only in prod
    sameSite: 'lax', // CSRF protection
    maxAge: 86400, // 24 hours
    path: '/',
  })

  return Response.json({ success: true })
}
```

**Delete Pattern:**

```tsx
// app/api/auth/logout/route.ts
export async function POST() {
  const cookieStore = await cookies()
  cookieStore.delete('session')
  return Response.json({ success: true })
}
```

**Critical:** `.set()` and `.delete()` only work in Route Handlers or Server Functions; streaming cannot start before cookie headers are set.

---

### 2. Reading Cookies in RSC with cookies()

**Server Component Pattern:**

```tsx
// app/page.tsx
import { cookies } from 'next/headers'

export default async function Page() {
  const cookieStore = await cookies()
  const session = cookieStore.get('session')?.value

  if (!session) return <h1>Not authenticated</h1>

  return <h1>Welcome back</h1>
}
```

**Must be async function.** Reading cookies opts component into dynamic rendering (cannot be pre-rendered).

---

### 3. Reading Cookies in proxy.ts via request.cookies

**proxy.ts Pattern (Next.js 16 replacement for middleware.ts):**

```tsx
// app/proxy.ts
import { NextRequest, NextResponse } from 'next/server'

export function proxy(request: NextRequest) {
  const session = request.cookies.get('session')?.value

  // Forward to backend, forward session header, etc.
  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/api/:path*', '/dashboard/:path*'],
}
```

**Breaking Change:** `middleware.ts` → `proxy.ts` with function rename. Edge runtime NOT supported; proxy is Node.js only. Keep `middleware.ts` only if edge runtime required.

---

### 4. Dynamic Route Handlers with Async Params

**Next.js 16 Breaking Change: `params` are now Promises**

```tsx
// app/api/users/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params // MUST await

  return NextResponse.json({ id })
}
```

**TypeScript type signature:**

```tsx
type Props = {
  params: Promise<{ id: string; action: string }>
  searchParams: Promise<Record<string, string>>
}

export async function POST(req: NextRequest, props: Props) {
  const { id, action } = await props.params
  return NextResponse.json({ id, action })
}
```

Migration: Run `npx next typegen` to auto-generate global type helpers.

---

### 5. Catch-All Proxy Route [...path]/route.ts

**For BFF proxy pattern forwarding to backend:**

```tsx
// app/api/proxy/[...path]/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest, props: { params: Promise<{ path: string[] }> }) {
  const { path } = await props.params
  const backendUrl = `${process.env.BACKEND_URL}/${path.join('/')}`

  const response = await fetch(backendUrl, {
    method: req.method,
    headers: {
      Authorization: req.cookies.get('session')?.value || '',
    },
    body: req.method !== 'GET' ? await req.text() : undefined,
  })

  // Copy backend response, preserve headers
  return new NextResponse(response.body, {
    status: response.status,
    headers: response.headers,
  })
}

export async function POST(req: NextRequest, props: { params: Promise<{ path: string[] }> }) {
  return GET(req, props) // Reuse logic
}

export async function DELETE(req: NextRequest, props: { params: Promise<{ path: string[] }> }) {
  return GET(req, props)
}
```

---

### 6. Security Best Practices: Cookie Flags

**Recommended Production Config:**

```tsx
cookieStore.set({
  name: 'session',
  value: token,
  httpOnly: true, // Blocks: document.cookie (XSS safe)
  secure: true, // Blocks: HTTP (downgrade attacks)
  sameSite: 'lax', // Default. Blocks: cross-site POST
  maxAge: 86400, // 24 hours
  path: '/',
  domain: undefined, // Same-origin only
})
```

**SameSite Values:**

- `'lax'` (default): Send with same-site requests + safe cross-site (GET). **Recommended.**
- `'strict'`: Never send with cross-site requests. Too restrictive for most UX.
- `'none'`: Send always (cross-site). Requires `secure: true`; use only for specific third-party flows.

**Token Lifetime:** 24-hour sessions + refresh token rotation (stored in httpOnly cookie or secure storage) for production.

---

### 7. Session Validation: Local JWT Decode vs /me Endpoint

**Option A: Local JWT Decode (Fast, No Backend Call)**

```tsx
// lib/auth/verify-session.ts
import { jwtVerify } from 'jose'

const secret = new TextEncoder().encode(process.env.JWT_SECRET!)

export async function verifySession(token: string) {
  try {
    const verified = await jwtVerify(token, secret)
    return verified.payload
  } catch {
    return null
  }
}

// app/api/me/route.ts
import { cookies } from 'next/headers'
import { verifySession } from '@/lib/auth/verify-session'

export async function GET() {
  const cookieStore = await cookies()
  const session = cookieStore.get('session')?.value

  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const payload = await verifySession(session)
  if (!payload) return Response.json({ error: 'Invalid token' }, { status: 401 })

  return Response.json({ user: payload })
}
```

**Option B: /me Endpoint (Safer for Revocation)**

```tsx
// Requires backend call; slower but detects revoked sessions
export async function GET() {
  const cookieStore = await cookies()
  const session = cookieStore.get('session')?.value

  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const backendRes = await fetch(`${process.env.BACKEND_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${session}` },
  })

  if (!backendRes.ok) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await backendRes.json()
  return Response.json({ user })
}
```

**Recommendation:** Local JWT decode for auth checks (speed), /me endpoint on sensitive operations (e.g., profile changes).

---

### 8. Next.js 16 Breaking Changes Affecting Cookies/Routes

| Change                       | Impact                                   | Migration                                          |
| ---------------------------- | ---------------------------------------- | -------------------------------------------------- |
| `cookies()` → async          | Route handlers must `await cookies()`    | Add `await`, wrap in async function                |
| `params` → Promise           | Dynamic routes receive promised params   | Add `await props.params`                           |
| `middleware.ts` → `proxy.ts` | Node.js runtime only; edge deprecated    | Rename file + function; remove edge runtime config |
| Streaming + cookies          | Can't set cookies after streaming starts | Set cookies before `await` in route handler        |

---

## Implementation Checklist

- [ ] Rename `middleware.ts` → `proxy.ts`, rename function signature
- [ ] Update all Route Handlers: `const store = await cookies()`
- [ ] Add `httpOnly: true, secure: true, sameSite: 'lax'` to all session cookies
- [ ] Add `await props.params` to all dynamic `[id]/route.ts` handlers
- [ ] Implement `/me` endpoint or local JWT verification
- [ ] Test logout flow: `cookieStore.delete('session')`
- [ ] Validate cookie flags in browser DevTools (Network → Response Headers)
- [ ] Set `BACKEND_URL` env var for proxy routes

---

## Unresolved Questions

1. Does project require refresh token rotation, or single 24-hour session token sufficient?
2. Prefer local JWT verification or /me backend call for `/me` endpoint?
3. Should proxy route forward all headers or whitelist specific ones?
4. CORS handling: proxy as BFF or separate CORS service?

---

## Sources

- [Next.js cookies() API Reference](https://nextjs.org/docs/app/api-reference/functions/cookies)
- [Dynamic Segments in Next.js 16](https://nextjs.org/docs/app/api-reference/file-conventions/dynamic-routes)
- [Upgrading to Next.js 16](https://nextjs.org/docs/app/guides/upgrading/version-16)
- [Middleware to Proxy Migration](https://nextjs.org/docs/messages/middleware-to-proxy)
- [Next.js Authentication Guide](https://nextjs.org/docs/app/guides/authentication)
- [Next.js Security Best Practices](https://nextjs.org/docs/app/guides/data-security)
- [Cookie Security Best Practices](https://developer.mozilla.org/en-US/docs/Web/Security/Practical_implementation_guides/Cookies)
