---
title: 'BFF Auth Refactor — Remove NextAuth, Add HttpOnly Cookie Pattern'
description: 'Replace NextAuth with a clean BFF auth layer using HttpOnly cookies and a data proxy'
status: pending
priority: P1
effort: 6h
branch: main
tags: [auth, bff, security, refactor]
created: 2026-03-30
---

# BFF Auth Refactor

## Goal

Remove `next-auth` entirely. Implement BFF auth pattern where the Next.js server manages HttpOnly cookies and proxies API requests with Bearer tokens. Client code never touches tokens.

## Current State

- NextAuth v5 beta with Credentials provider (`src/lib/auth.ts`)
- `proxy.ts` re-exports NextAuth's `auth` as middleware
- Zustand stores `accessToken` in client memory (synced via SessionProvider)
- `client.ts` reads token from Zustand, `server.ts` reads from NextAuth session
- SWR hooks call external API directly from browser via `NEXT_PUBLIC_API_URL`

## Target State

- `session_token` HttpOnly cookie holds JWT from backend API
- `/api/auth/login` POST, `/api/auth/logout` POST, `/api/auth/me` GET — BFF auth routes
- `/api/proxy/[...path]` — BFF data proxy forwards requests with Bearer token
- Zustand stores `User | null` (no token), hydrated from `/api/auth/me` on mount
- SWR hooks call `/api/proxy/*` (same-origin), never external API directly
- `proxy.ts` checks `session_token` cookie existence for route protection

## Phases

| #   | Phase                                                      | Status  | Effort |
| --- | ---------------------------------------------------------- | ------- | ------ |
| 1   | [Remove NextAuth](./phase-01-remove-nextauth.md)           | pending | 30m    |
| 2   | [BFF Auth Routes](./phase-02-bff-auth-routes.md)           | pending | 1.5h   |
| 3   | [BFF Data Proxy](./phase-03-bff-data-proxy.md)             | pending | 1h     |
| 4   | [Fetch Factory Update](./phase-04-fetch-factory-update.md) | pending | 45m    |
| 5   | [Auth Store & Provider](./phase-05-auth-store-provider.md) | pending | 1h     |
| 6   | [Proxy, LoginForm, Env](./phase-06-proxy-loginform-env.md) | pending | 1.25h  |

## Key Dependencies

- Phases 1-3 are sequential (delete old, create new auth, create proxy)
- Phase 4 depends on Phase 3 (proxy route must exist)
- Phase 5 depends on Phase 2 (auth routes must exist)
- Phase 6 depends on all prior phases

## Risk Summary

- Next.js 16 async `cookies()` — must `await` everywhere
- `proxy.ts` uses `proxy` export (not `middleware`) — verify behavior
- Cookie not sent on first SSR request after login (redirect handles this)
