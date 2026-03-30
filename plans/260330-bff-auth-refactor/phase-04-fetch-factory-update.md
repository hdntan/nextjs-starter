# Phase 4 — Fetch Factory Update

## Context Links

- [Plan Overview](./plan.md) | [Phase 3](./phase-03-bff-data-proxy.md)
- Current: `src/lib/api/client.ts`, `src/lib/api/server.ts`, `src/lib/api/builder.ts`

## Overview

- **Priority:** P1
- **Status:** pending
- **Description:** Update the API client layer so client-side calls go through `/api/proxy/*` (no token) and server-side calls read the session cookie directly.

## Key Insights

- Client-side: no token needed — cookie is sent automatically on same-origin `/api/proxy/*` requests, but the proxy route reads it server-side. The `buildApiClient` call no longer needs a token.
- Server-side: reads `session_token` from cookie via `getSessionToken()` helper, passes as Bearer token to backend directly (no proxy needed for SSR).
- `NEXT_PUBLIC_API_URL` env var can be removed; client base URL becomes empty string (same origin)

## Requirements

### Functional

- `createClientApiClient()` uses `/api/proxy` as base URL, no token
- `createServerApiClient()` reads cookie token, uses `env.API_URL` as base URL
- SWR hooks continue working without changes (they call service functions that use the client)

### Non-functional

- No breaking changes to `ApiClient` interface or service layer

## Architecture

```
Client Component --> createClientApiClient() --> baseUrl="/api/proxy", token=undefined
  --> netFetch("/api/proxy/items") --> same-origin fetch --> proxy route --> backend

Server Component --> createServerApiClient() --> baseUrl=env.API_URL, token=cookieToken
  --> netFetch("https://api.example.com/items") --> direct fetch --> backend
```

## Related Code Files

### Modify

- `src/lib/api/client.ts` — change base URL to `/api/proxy`, remove token
- `src/lib/api/server.ts` — use `getSessionToken()` instead of NextAuth session

### No changes needed

- `src/lib/api/builder.ts` — already accepts optional token
- `src/lib/api/types.ts` — unchanged
- `src/lib/api/services/items.ts` — unchanged (uses ApiClient interface)
- `src/hooks/use-items.ts` — unchanged (calls service with client)

## Implementation Steps

### Step 1: Update `src/lib/api/client.ts`

```ts
import { buildApiClient } from './builder'
import type { ApiClient } from './types'

export function createClientApiClient(): ApiClient {
  return buildApiClient({ baseUrl: '/api/proxy' })
}
```

- Remove `useAuthStore` import
- Remove `NEXT_PUBLIC_API_URL` usage
- No token parameter — proxy handles auth server-side

### Step 2: Update `src/lib/api/server.ts`

```ts
import { getSessionToken } from '@/lib/auth/cookie'
import { buildApiClient } from './builder'
import { env } from '@/config/env'
import type { ApiClient } from './types'

export async function createServerApiClient(): Promise<ApiClient> {
  const token = await getSessionToken()
  return buildApiClient({ token, baseUrl: env.API_URL })
}
```

### Step 3: Remove `NEXT_PUBLIC_API_URL` from `.env` files

- Check `.env.example`, `.env.local`, etc. and remove the public API URL variable
- Client no longer needs direct backend access

### Step 4: Validate

- Run `npm run typecheck`
- Verify SWR hooks still work by checking `use-items.ts` imports are unchanged

## Todo

- [ ] Update `src/lib/api/client.ts`
- [ ] Update `src/lib/api/server.ts`
- [ ] Remove `NEXT_PUBLIC_API_URL` from env files
- [ ] Typecheck passes
- [ ] Verify SWR hooks unaffected

## Success Criteria

- `createClientApiClient()` has zero token logic
- `createServerApiClient()` reads from cookie, not NextAuth
- All existing SWR hooks and service functions compile without changes
- No `NEXT_PUBLIC_API_URL` references in client code

## Risk Assessment

- **Risk:** SWR revalidation fails if proxy returns non-JSON — mitigate by ensuring proxy always returns JSON
- **Risk:** Server component cookie reading fails during static generation — mitigate by only using in dynamic routes

## Security Considerations

- Token no longer stored in Zustand (client memory) — eliminated XSS vector
- Server-side token access is cookie-based, scoped to request lifecycle
- No public-facing API URL exposed in client bundle

## Next Steps

Phase 5 — Auth Store & Provider
