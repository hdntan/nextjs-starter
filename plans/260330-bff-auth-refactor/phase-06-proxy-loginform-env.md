# Phase 6 — Proxy, LoginForm, Env Cleanup

## Context Links

- [Plan Overview](./plan.md) | [Phase 5](./phase-05-auth-store-provider.md)
- Current: `src/proxy.ts`, `src/app/(auth)/login/_components/login-form.tsx`, `src/config/env.ts`, `src/components/providers/index.tsx`

## Overview

- **Priority:** P1
- **Status:** pending
- **Description:** Final wiring phase. Update middleware (proxy.ts) to check session cookie. Update LoginForm to use `useAuth` hook. Clean env validation. Swap AuthProvider into Providers composition.

## Key Insights

- `proxy.ts` in Next.js 16 exports a `proxy` function (renamed from `middleware`). It runs on the Node.js runtime, so full `cookies()` access is available. However, middleware in Next.js uses `request.cookies` (not `cookies()` from `next/headers`).
- LoginForm currently uses `signIn` from `next-auth/react` — replace with `useAuth().login()`
- `env.ts` currently validates `NEXTAUTH_SECRET` and `NEXTAUTH_URL` — remove both, keep only `API_URL`

## Requirements

### Functional

- Protected routes redirect to `/login` when no `session_token` cookie
- Login form submits via `useAuth().login()`, redirects on success
- Env validation only requires `API_URL`
- AuthProvider wraps app in providers composition

### Non-functional

- Middleware must be fast — only cookie existence check, no API calls
- Clean compile with `npm run typecheck && npm run build`

## Architecture

```
Request --> proxy.ts: check session_token cookie
  --> Present: NextResponse.next()
  --> Absent: NextResponse.redirect('/login')
```

## Related Code Files

### Modify

- `src/proxy.ts`
- `src/app/(auth)/login/_components/login-form.tsx`
- `src/config/env.ts`
- `src/components/providers/index.tsx`

## Implementation Steps

### Step 1: Update `src/proxy.ts`

```ts
import { NextRequest, NextResponse } from 'next/server'
import { SESSION_COOKIE_NAME } from '@/lib/auth/cookie'

export function proxy(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)

  if (!token) {
    const loginUrl = new URL('/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!login|api|_next/static|_next/image|favicon.ico).*)'],
}
```

Note: uses `request.cookies` (sync, available in middleware), not `cookies()` from `next/headers`.

### Step 2: Update `src/app/(auth)/login/_components/login-form.tsx`

```ts
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/hooks/use-auth'

const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password required'),
})

type LoginFormData = z.infer<typeof loginSchema>

export function LoginForm() {
  const router = useRouter()
  const { login } = useAuth()
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  async function onSubmit(data: LoginFormData) {
    try {
      setError(null)
      const result = await login(data.email, data.password)
      if (!result.success) {
        setError(result.error ?? 'Invalid email or password')
        return
      }
      router.push('/')
      router.refresh()
    } catch {
      setError('Something went wrong')
    }
  }

  // ... rest of JSX unchanged
}
```

### Step 3: Update `src/config/env.ts`

```ts
import { z } from 'zod'

const envSchema = z.object({
  API_URL: z.string().url(),
})

const result = envSchema.safeParse({
  API_URL: process.env.API_URL,
})

if (!result.success) {
  const missing = Object.entries(result.error.flatten().fieldErrors)
    .map(([key, errors]) => `  ${key}: ${errors?.join(', ')}`)
    .join('\n')
  throw new Error(`Missing or invalid environment variables:\n${missing}`)
}

export const env = result.data
```

### Step 4: Update `src/components/providers/index.tsx`

```ts
'use client'

import { AuthProvider } from './auth-provider'
import { SWRProvider } from './swr-provider'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <SWRProvider>{children}</SWRProvider>
    </AuthProvider>
  )
}
```

### Step 5: Cleanup

- Remove `.env` / `.env.example` entries for `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `NEXT_PUBLIC_API_URL`
- Run `grep -r "next-auth\|NEXTAUTH\|NEXT_PUBLIC_API_URL" src/` to confirm zero matches
- Run `npm run typecheck && npm run build`

### Step 6: Smoke test

- `npm run dev`
- Visit `/` — should redirect to `/login` (no cookie)
- Submit login form — should set cookie and redirect to `/`
- Visit `/` — should load (cookie present), SWR hooks call `/api/proxy/items`
- Click logout — should clear cookie and redirect to `/login`

## Todo

- [ ] Update `src/proxy.ts`
- [ ] Update `src/app/(auth)/login/_components/login-form.tsx`
- [ ] Update `src/config/env.ts`
- [ ] Update `src/components/providers/index.tsx`
- [ ] Remove stale env vars from .env files
- [ ] Grep for remaining next-auth references
- [ ] Typecheck + build passes
- [ ] Smoke test login/logout flow

## Success Criteria

- Full auth flow works: login -> protected route -> logout -> redirect to login
- Zero `next-auth` references in codebase
- Zero token exposure in client-side JavaScript
- `npm run build` succeeds
- `npm run lint` passes

## Risk Assessment

- **Risk:** `proxy.ts` export name incorrect for Next.js 16 — verify with Next.js 16 docs that `proxy` is the correct export name
- **Risk:** Cookie import path from `@/lib/auth/cookie` in middleware — middleware may have restricted import resolution; test this
- **Risk:** `router.refresh()` after login may not pick up new cookie immediately — the redirect through middleware should handle this

## Security Considerations

- Middleware only checks cookie existence, not validity — backend validates token on actual API calls
- Login page excluded from middleware matcher — no redirect loop
- `/api/*` routes excluded from middleware — auth routes accessible without cookie
- No token in URL params or localStorage

## Next Steps

- Add refresh token rotation (backend must support it)
- Add CSRF token for additional POST protection
- Add rate limiting on auth endpoints
- Add session expiry handling (401 from proxy -> clear store -> redirect to login)

## Unresolved Questions

- Does Next.js 16 `proxy.ts` support `@/` path aliases for imports? If not, use relative imports in proxy.ts.
- Should `/api/auth/me` be cached with SWR to avoid re-fetching on every mount? Currently fetched once per mount which is acceptable.
