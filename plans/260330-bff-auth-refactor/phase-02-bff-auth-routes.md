# Phase 2 — BFF Auth Routes

## Context Links

- [Plan Overview](./plan.md) | [Phase 1](./phase-01-remove-nextauth.md)
- External API assumed to have: `POST /auth/login` (returns `{ accessToken, user }`), `GET /auth/me` (returns `{ user }`)

## Overview

- **Priority:** P1
- **Status:** pending
- **Description:** Create `/api/auth/[action]/route.ts` with three handlers: login (POST), logout (POST), me (GET). These set/read/clear the `session_token` HttpOnly cookie.

## Key Insights

- Next.js 16: `params` is `Promise<{ action: string }>` — must `await` it
- Next.js 16: `cookies()` is async — must `await` it
- Cookie holds the raw JWT from the backend; no secondary encryption needed since HttpOnly prevents JS access
- `/api/auth/me` reads cookie, calls backend `/auth/me` with Bearer token, returns user JSON to client

## Requirements

### Functional

- `POST /api/auth/login` — accepts `{ email, password }`, calls backend, sets `session_token` cookie, returns user
- `POST /api/auth/logout` — clears `session_token` cookie, returns 200
- `GET /api/auth/me` — reads cookie, calls backend `/auth/me`, returns user or 401

### Non-functional

- All responses are JSON
- Error responses include `{ error: string }`
- Cookie options centralized in a shared constant

## Architecture

```
Browser --POST /api/auth/login--> Next.js Route Handler --POST /auth/login--> Backend API
Browser <--Set-Cookie: session_token-- Next.js Route Handler <--{ accessToken, user }-- Backend API
```

## Related Code Files

### Create

- `src/types/auth.ts` — `User` interface, `LoginResponse` type
- `src/lib/auth/cookie.ts` — `COOKIE_NAME`, `COOKIE_OPTIONS`, helper functions `setSessionCookie`, `clearSessionCookie`, `getSessionToken`
- `src/app/api/auth/[action]/route.ts` — route handler

### Reference

- `src/config/env.ts` — `env.API_URL` for backend base URL
- `src/lib/net/net.ts` — `netFetch` for backend calls

## Implementation Steps

### Step 1: Create `src/types/auth.ts`

```ts
export interface User {
  id: string
  email: string
  name?: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  accessToken: string
  user: User
}
```

### Step 2: Create `src/lib/auth/cookie.ts`

```ts
import { cookies } from 'next/headers'

export const SESSION_COOKIE_NAME = 'session_token'

export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 60 * 60 * 24 * 7, // 7 days
}

export async function setSessionCookie(token: string): Promise<void> {
  const jar = await cookies()
  jar.set(SESSION_COOKIE_NAME, token, COOKIE_OPTIONS)
}

export async function clearSessionCookie(): Promise<void> {
  const jar = await cookies()
  jar.delete(SESSION_COOKIE_NAME)
}

export async function getSessionToken(): Promise<string | undefined> {
  const jar = await cookies()
  return jar.get(SESSION_COOKIE_NAME)?.value
}
```

### Step 3: Create `src/app/api/auth/[action]/route.ts`

- Import `netFetch` from `@/lib/net/net`
- Import cookie helpers
- Import `env` for `API_URL`
- `GET` handler: if action is `me`, read token, fetch backend, return user or 401
- `POST` handler: if action is `login`, parse body, call backend `/auth/login`, set cookie, return user; if action is `logout`, clear cookie, return 200
- Default: return 404

### Step 4: Validate

- Run `npm run typecheck`
- Manual test with `curl -X POST localhost:3000/api/auth/login -H 'Content-Type: application/json' -d '{"email":"...","password":"..."}'`

## Todo

- [ ] Create `src/types/auth.ts`
- [ ] Create `src/lib/auth/cookie.ts`
- [ ] Create `src/app/api/auth/[action]/route.ts`
- [ ] Typecheck passes
- [ ] Manual curl test

## Success Criteria

- Login sets HttpOnly cookie visible in browser DevTools (Application > Cookies)
- `/api/auth/me` returns user when cookie present, 401 when absent
- Logout clears cookie
- No token exposed in response body (only user data)

## Risk Assessment

- **Risk:** Backend API contract mismatch — mitigate by making response types configurable
- **Risk:** Cookie not sent cross-origin — not applicable since all requests are same-origin `/api/*`

## Security Considerations

- HttpOnly cookie prevents XSS token theft
- SameSite=Lax prevents CSRF on state-changing POST (browser won't send cookie on cross-origin POST)
- Secure flag in production ensures HTTPS-only
- No token in response body — only `User` object returned to client
- Rate limiting on login endpoint should be added as a future enhancement

## Next Steps

Phase 3 — BFF Data Proxy
