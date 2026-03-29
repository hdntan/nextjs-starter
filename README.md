# Next.js App Router Core Starter

Starter template for mid-size teams (4–10 devs) building content-heavy catalog UIs.
Synthesizes Apple App Store frontend patterns (Net fetch wrapper, Shelf/Item hierarchy, delayed-spinner Suspense) with OpenEdu conventions (SWR + Zustand data layer, next-auth v5, TypeScript strict, shadcn/ui).

**Architecture approach:** Service Layer Controller — RSC pages act as implicit intent controllers; service functions handle data fetching; dual-context API client manages server/client token injection.

---

## Quick Start

```bash
cp .env.example .env.local
# fill in values
pnpm install
pnpm dev
```

---

## Directory Structure

```
src/
├── app/
│   ├── (auth)/login/           # Login page + form component
│   ├── (main)/                 # Authenticated app shell
│   │   ├── [slug]/             # Detail page
│   │   └── _components/        # Route-local client components
│   └── api/auth/[...nextauth]/ # next-auth route handler
├── components/
│   ├── ui/                     # shadcn/ui primitives + Spinner + ErrorPage
│   ├── shelf/                  # Shelf layout container
│   ├── item/                   # ItemCard + type-specific cards
│   ├── layout/                 # Header, Footer, Navigation
│   └── providers/              # SessionProvider, SWRProvider, Providers
├── lib/
│   ├── api/                    # builder, server, client, services/
│   ├── net/                    # netFetch, ApiError, correlation ID
│   └── auth.ts                 # next-auth v5 config
├── hooks/                      # SWR hooks (keys.ts, use-items.ts)
├── store/                      # Zustand stores (auth.store, ui.store)
├── config/                     # env.ts (Zod-validated), constants.ts
└── types/                      # content.ts, api.ts, next-auth.d.ts
```

---

## Design Rules

| #   | Rule                                                                                       |
| --- | ------------------------------------------------------------------------------------------ |
| 1   | Never call `fetch()` directly — use `createServerApiClient()` or `createClientApiClient()` |
| 2   | RSC `page.tsx` calls service functions, not API clients directly                           |
| 3   | SWR hooks only in `hooks/`, never inline in components                                     |
| 4   | Zustand stores for UI state only — zero API data                                           |
| 5   | `loading.tsx` at every dynamic route segment                                               |
| 6   | Discriminated unions for all content types                                                 |
| 7   | Zod schema in `config/env.ts` validates all env vars at startup                            |
| 8   | `ItemVariant` and `ShelfVariant` types are exhaustive from day one                         |

---

## Key Patterns

### Net Wrapper

All HTTP goes through `netFetch()` which injects: Authorization header, `x-request-id` correlation ID, Content-Type. Non-2xx responses throw `ApiError` with status + parsed message.

### Dual-Context API Client

- **Server**: `createServerApiClient()` — reads token from `auth()` session (RSC/Server Actions only)
- **Client**: `createClientApiClient()` — reads token from Zustand auth store (`'use client'` only)

### RSC Controller Pattern

```tsx
// page.tsx (RSC) — intent controller
const api = await createServerApiClient()
const items = await listItems(api)
return <ItemsCatalog initialData={items} />

// ItemsCatalog.tsx ('use client') — SWR hydrated
const { items } = useItems(initialData) // fallbackData → zero flash
```

### Shelf / Item System

```tsx
<Shelf variant="grid-3" title="Featured" cta={{ label: 'See all', href: '/items' }}>
  {items.map((item) => (
    <ItemCard key={item.id} variant="md" data={item} />
  ))}
</Shelf>
```

Shelf variants: `horizontal-scroll | grid-2 | grid-3 | grid-4 | hero`
Item variants: `sm | md | lg | brick`

### Delayed Spinner (Apple 500ms pattern)

```tsx
<DelayedSpinner delay={500} /> // shows nothing for 500ms, then spinner
// Used in all loading.tsx files
```

---

## Adding a New Domain

1. Add type to `ContentModel` union in `src/types/content.ts`
2. Create service in `src/lib/api/services/`
3. Create SWR hook in `src/hooks/`
4. Add SWR key to `src/hooks/keys.ts`
5. Create card component in `src/components/item/`
6. Add `case` to `renderCard` switch in `src/components/item/item-card.tsx`
7. Create page in `src/app/(main)/`

---

## Environment Variables

| Variable              | Required | Description                                |
| --------------------- | -------- | ------------------------------------------ |
| `API_URL`             | Server   | Backend API base URL (server-only)         |
| `NEXT_PUBLIC_API_URL` | Client   | Backend API base URL (browser-accessible)  |
| `NEXTAUTH_SECRET`     | Yes      | Random string min 32 chars for JWT signing |
| `NEXTAUTH_URL`        | Yes      | App base URL for next-auth                 |

---

## Developer Tooling

```bash
pnpm lint          # ESLint on src/
pnpm lint:fix      # ESLint with auto-fix
pnpm format        # Prettier write
pnpm format:check  # Prettier check
pnpm typecheck     # tsc --noEmit
```

**Pre-commit hook**: runs `lint-staged` (ESLint fix + Prettier write on staged files)
**Commit-msg hook**: `commitlint` enforces conventional commit format (`feat:`, `fix:`, `chore:`, etc.)

---

## Replacing the Example Domain

The "Items" domain (`src/lib/api/services/items.ts`, `src/hooks/use-items.ts`) is a placeholder.
Replace with your actual domain types and API endpoints, then update the pages in `src/app/(main)/`.
