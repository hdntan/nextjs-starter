# Phase 1 — Remove NextAuth

## Context Links

- [Plan Overview](./plan.md)
- Current files: `src/lib/auth.ts`, `src/app/api/auth/[...nextauth]/route.ts`, `src/types/next-auth.d.ts`

## Overview

- **Priority:** P1 (blocker for all subsequent phases)
- **Status:** pending
- **Description:** Delete all NextAuth files, remove the npm dependency, and clean up any remaining imports so the project compiles (with expected errors in files modified in later phases).

## Key Insights

- NextAuth v5 beta is deeply integrated: middleware re-export, session provider, server API client, Zustand sync
- Removing it first creates a clean slate but temporarily breaks compilation; that is acceptable since phases are applied sequentially in a single branch

## Requirements

### Functional

- All NextAuth-specific files deleted
- `next-auth` removed from `package.json`
- No `next-auth` imports remain anywhere

### Non-functional

- Must not leave orphan type references

## Architecture

No new architecture in this phase — purely destructive cleanup.

## Related Code Files

### Delete

- `src/lib/auth.ts`
- `src/app/api/auth/[...nextauth]/route.ts`
- `src/types/next-auth.d.ts`
- `src/components/providers/session-provider.tsx`

### Modify

- `src/components/providers/index.tsx` — remove SessionProvider import (temporary; replaced in Phase 5)
- `src/proxy.ts` — remove `auth` import (temporary; replaced in Phase 6)
- `src/lib/api/server.ts` — remove `auth` import (temporary; replaced in Phase 4)
- `src/app/(auth)/login/_components/login-form.tsx` — remove `signIn` import (temporary; replaced in Phase 6)

## Implementation Steps

1. Delete the four files listed above
2. Run `npm uninstall next-auth`
3. In `src/components/providers/index.tsx`, remove SessionProvider import and wrapper — just render `<SWRProvider>{children}</SWRProvider>` for now
4. In `src/proxy.ts`, export a no-op `proxy` function that calls `NextResponse.next()` to keep the app runnable
5. In `src/lib/api/server.ts`, remove auth import; temporarily hardcode `token = undefined`
6. In `src/app/(auth)/login/_components/login-form.tsx`, remove `signIn` import; leave form shell with a `TODO` comment
7. Run `npm run typecheck` — confirm only expected errors remain

## Todo

- [ ] Delete NextAuth files
- [ ] Uninstall next-auth package
- [ ] Update providers/index.tsx
- [ ] Stub proxy.ts
- [ ] Stub server.ts
- [ ] Stub login-form.tsx
- [ ] Verify typecheck

## Success Criteria

- `npm run typecheck` passes (or only has planned TODOs)
- `npm run build` succeeds
- No `next-auth` string in `node_modules/.package-lock.json` or `package.json`

## Risk Assessment

- **Risk:** Breaking imports in files not yet tracked — mitigate with `grep -r "next-auth" src/`
- **Risk:** Runtime crash if proxy.ts stub is wrong — mitigate by testing `npm run dev`

## Security Considerations

- Removing auth temporarily leaves routes unprotected; acceptable since this is dev-only and Phase 6 restores protection

## Next Steps

Phase 2 — create BFF auth route handlers
