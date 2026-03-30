# Phase 5 — Auth Store & Provider

## Context Links

- [Plan Overview](./plan.md) | [Phase 4](./phase-04-fetch-factory-update.md)
- Current: `src/store/auth.store.ts`, `src/components/providers/session-provider.tsx` (deleted in Phase 1)

## Overview

- **Priority:** P1
- **Status:** pending
- **Description:** Refactor Zustand auth store to hold `User | null` instead of `accessToken`. Create `AuthProvider` that hydrates user from `/api/auth/me` on mount. Create `useAuth` hook for login/logout/user access.

## Key Insights

- Store no longer holds tokens — only user info for UI rendering
- `AuthProvider` wraps app, calls `/api/auth/me` on mount to check if session cookie is valid
- `useAuth` hook provides `login()`, `logout()`, `user`, `isLoading` — single interface for all auth operations
- Login/logout call BFF routes, then update Zustand store

## Requirements

### Functional

- `useAuthStore` holds `User | null` and `isLoading` boolean
- `AuthProvider` fetches `/api/auth/me` on mount, populates store
- `useAuth()` returns `{ user, isLoading, login, logout }`
- `login(email, password)` calls `/api/auth/login`, updates store, returns `{ success, error? }`
- `logout()` calls `/api/auth/logout`, clears store, redirects to `/login`

### Non-functional

- No flash of unauthenticated content (isLoading state)
- Single source of truth for auth state

## Architecture

```
App Mount --> AuthProvider --> fetch /api/auth/me --> setUser(user) or setUser(null)
Login Form --> useAuth().login() --> POST /api/auth/login --> setUser(user)
Header --> useAuth().logout() --> POST /api/auth/logout --> setUser(null) --> redirect /login
```

## Related Code Files

### Modify

- `src/store/auth.store.ts` — change from accessToken to User state

### Create

- `src/hooks/use-auth.ts` — useAuth hook
- `src/components/providers/auth-provider.tsx` — replaces session-provider

### Modify (later in Phase 6)

- `src/components/providers/index.tsx` — swap in AuthProvider

## Implementation Steps

### Step 1: Update `src/store/auth.store.ts`

```ts
import { create } from 'zustand'
import type { User } from '@/types/auth'

interface AuthState {
  user: User | null
  isLoading: boolean
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  setUser: (user) => set({ user, isLoading: false }),
  setLoading: (isLoading) => set({ isLoading }),
}))
```

### Step 2: Create `src/hooks/use-auth.ts`

```ts
'use client'

import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth.store'
import type { User } from '@/types/auth'

interface LoginResult {
  success: boolean
  error?: string
}

export function useAuth() {
  const router = useRouter()
  const { user, isLoading } = useAuthStore()

  async function login(email: string, password: string): Promise<LoginResult> {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      if (!res.ok) {
        const data = await res.json()
        return { success: false, error: data.error ?? 'Login failed' }
      }
      const { user } = (await res.json()) as { user: User }
      useAuthStore.getState().setUser(user)
      return { success: true }
    } catch {
      return { success: false, error: 'Network error' }
    }
  }

  async function logout(): Promise<void> {
    await fetch('/api/auth/logout', { method: 'POST' })
    useAuthStore.getState().setUser(null)
    router.push('/login')
  }

  return { user, isLoading, login, logout }
}
```

### Step 3: Create `src/components/providers/auth-provider.tsx`

```ts
'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/store/auth.store'
import type { User } from '@/types/auth'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const setUser = useAuthStore((s) => s.setUser)

  useEffect(() => {
    async function hydrate() {
      try {
        const res = await fetch('/api/auth/me')
        if (res.ok) {
          const data = await res.json() as { user: User }
          setUser(data.user)
        } else {
          setUser(null)
        }
      } catch {
        setUser(null)
      }
    }
    hydrate()
  }, [setUser])

  return <>{children}</>
}
```

### Step 4: Validate

- Run `npm run typecheck`
- Verify no circular imports

## Todo

- [ ] Update `src/store/auth.store.ts`
- [ ] Create `src/hooks/use-auth.ts`
- [ ] Create `src/components/providers/auth-provider.tsx`
- [ ] Typecheck passes

## Success Criteria

- `useAuth()` provides user, isLoading, login, logout
- AuthProvider hydrates user state on mount
- Zustand store contains no token — only User data
- No NextAuth references anywhere

## Risk Assessment

- **Risk:** Race condition between AuthProvider hydration and protected component render — mitigate with `isLoading` guard
- **Risk:** `/api/auth/me` called on every page navigation — acceptable for SPA mounts; cookie-based so cheap. Consider SWR caching later.

## Security Considerations

- Token never enters client-side JavaScript
- User object contains only display data (id, email, name)
- Login function handles errors without leaking server details

## Next Steps

Phase 6 — Wire up proxy.ts, LoginForm, env, providers
