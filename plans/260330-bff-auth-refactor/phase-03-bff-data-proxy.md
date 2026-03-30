# Phase 3 — BFF Data Proxy

## Context Links

- [Plan Overview](./plan.md) | [Phase 2](./phase-02-bff-auth-routes.md)
- Cookie helpers: `src/lib/auth/cookie.ts`

## Overview

- **Priority:** P1
- **Status:** pending
- **Description:** Create `/api/proxy/[...path]/route.ts` that forwards all requests to the backend API with the Bearer token from the `session_token` cookie. Client SWR hooks call this instead of the external API directly.

## Key Insights

- Eliminates need for `NEXT_PUBLIC_API_URL` — browser never contacts backend directly
- Token stays server-side; client sends plain fetch to `/api/proxy/items`
- Must forward all HTTP methods (GET, POST, PUT, DELETE)
- Must forward request body, query params, and relevant headers
- Next.js 16: `params` is `Promise<{ path: string[] }>` — must await

## Requirements

### Functional

- `GET/POST/PUT/DELETE /api/proxy/*` forwards to `env.API_URL/*` with Bearer token
- Query string parameters preserved
- Request body forwarded for POST/PUT
- Response status and body returned as-is
- Returns 401 if no session cookie present

### Non-functional

- Streaming not required (JSON API responses are small)
- Correlation ID header forwarded

## Architecture

```
Browser --GET /api/proxy/items?page=1--> Next.js Route Handler --GET /items?page=1 + Bearer--> Backend API
Browser <--JSON response--              Next.js Route Handler <--JSON response--              Backend API
```

## Related Code Files

### Create

- `src/app/api/proxy/[...path]/route.ts`

### Reference

- `src/lib/auth/cookie.ts` — `getSessionToken`
- `src/config/env.ts` — `env.API_URL`
- `src/config/constants.ts` — `CORRELATION_ID_HEADER`
- `src/lib/net/correlation.ts` — `generateCorrelationId`

## Implementation Steps

### Step 1: Create `src/app/api/proxy/[...path]/route.ts`

```ts
import { NextRequest, NextResponse } from 'next/server'
import { getSessionToken } from '@/lib/auth/cookie'
import { env } from '@/config/env'
import { CORRELATION_ID_HEADER } from '@/config/constants'
import { generateCorrelationId } from '@/lib/net/correlation'

async function proxyRequest(
  request: NextRequest,
  params: Promise<{ path: string[] }>
): Promise<NextResponse> {
  const token = await getSessionToken()
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { path } = await params
  const targetPath = `/${path.join('/')}`
  const url = new URL(targetPath, env.API_URL)
  url.search = request.nextUrl.search // preserve query params

  const headers = new Headers()
  headers.set('Authorization', `Bearer ${token}`)
  headers.set('Content-Type', 'application/json')
  headers.set(CORRELATION_ID_HEADER, generateCorrelationId())

  const body = ['GET', 'HEAD'].includes(request.method) ? undefined : await request.text()

  const response = await fetch(url.toString(), {
    method: request.method,
    headers,
    body: body || undefined,
  })

  const data = await response.text()
  return new NextResponse(data, {
    status: response.status,
    headers: { 'Content-Type': response.headers.get('Content-Type') ?? 'application/json' },
  })
}

export const GET = proxyRequest
export const POST = proxyRequest
export const PUT = proxyRequest
export const DELETE = proxyRequest
```

### Step 2: Validate

- Run `npm run typecheck`
- Manual test: after login, `curl localhost:3000/api/proxy/items -b 'session_token=...'`

## Todo

- [ ] Create proxy route handler
- [ ] Typecheck passes
- [ ] Manual test with curl

## Success Criteria

- Requests to `/api/proxy/items` are forwarded to `API_URL/items` with Bearer token
- Query params preserved
- POST body forwarded correctly
- 401 returned when no cookie

## Risk Assessment

- **Risk:** Large request bodies — mitigate by streaming in future if needed; JSON payloads are small
- **Risk:** Timeout on slow backend — Next.js route handlers have default timeout; add explicit timeout later if needed
- **Risk:** Path traversal — the path is used as URL path segment to a trusted backend; no filesystem access

## Security Considerations

- Token only added server-side; never exposed to client
- Only forwards to `env.API_URL` — no open redirect risk
- CORS not needed since requests are same-origin
- Consider adding request size limit in production

## Next Steps

Phase 4 — Update fetch factory to use proxy
