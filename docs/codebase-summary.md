# Codebase Summary

**Version**: 0.1.0
**Last Updated**: 2026-03-30
**Language**: TypeScript 5.x (strict mode)
**Framework**: Next.js 16.2.1 (App Router)

## Overview

A content catalog application built with Next.js App Router, featuring type-safe APIs, real-time data synchronization, and enterprise authentication patterns. Total codebase: 79 files, ~20.5k tokens.

---

## File Organization

### Source Code Structure (`src/`)

#### App Routes (`src/app/`)

- **Root Layout** (`layout.tsx`, 34 LOC): Provider composition, Geist fonts, global styles
- **Root Globals** (`globals.css`): Tailwind CSS base styles (~4.3k chars)
- **(main) Route Group**: Public content shell (authenticated)
  - `layout.tsx` (13 LOC): Header, main, footer structure
  - `page.tsx` (27 LOC): Home page with RSC data fetching
  - `error.tsx` (14 LOC): Error boundary with error UI fallback
  - `loading.tsx` (6 LOC): Suspense boundary with DelayedSpinner
  - `[slug]/page.tsx` (31 LOC): Dynamic detail page
  - `_components/items-catalog.tsx` (37 LOC): Client component with SWR hydration
  - `_components/item-detail.tsx` (54 LOC): Detail view with client-side interactivity
- **(auth) Route Group**: Authentication pages
  - `layout.tsx` (4 LOC): Centered layout wrapper
  - `login/page.tsx` (11 LOC): Login page
  - `login/_components/login-form.tsx` (69 LOC): RHF + Zod form component
- **API Routes**: `api/auth/[...nextauth]/route.ts` (3 LOC)

#### Components (`src/components/`)

**UI Primitives** (`components/ui/`)

- `button.tsx` (61 LOC): CVA variant system, Base UI integration
- `card.tsx` (93 LOC): Compound component pattern
- `input.tsx` (21 LOC): Form input with Base UI wrapper
- `badge.tsx` (50 LOC): CVA variants for status badges
- `spinner.tsx` (21 LOC): Animated loading indicator
- `delayed-spinner.tsx` (21 LOC): 500ms delay spinner (Apple pattern)
- `skeleton.tsx` (14 LOC): Pulse animation placeholder
- `error-page.tsx` (26 LOC): Error fallback UI

**Layout Components** (`components/layout/`)

- `header.tsx` (19 LOC): Sticky header with backdrop blur
- `footer.tsx` (10 LOC): Footer with basic structure
- `navigation.tsx` (34 LOC): Active-state navigation links

**Providers** (`components/providers/`)

- `index.tsx` (13 LOC): Provider composition root
- `session-provider.tsx` (30 LOC): NextAuth + Zustand token sync
- `swr-provider.tsx` (26 LOC): SWR configuration and defaults

**Item Components** (`components/item/`)

- `item-card.tsx` (45 LOC): Factory/dispatcher pattern router with keyboard accessibility
- `generic-item-card.tsx` (59 LOC): Base card (sm/md/lg/brick variants)
- `course-card.tsx` (63 LOC): Course-specific card display
- `event-card.tsx` (60 LOC): Event-specific card display
- `article-card.tsx` (60 LOC): Article-specific card display
- `index.ts` (2 LOC): Barrel export

**Shelf Components** (`components/shelf/`)

- `shelf.tsx` (29 LOC): Grid/scroll layout container
- `shelf-header.tsx` (20 LOC): Title with CTA link
- `index.ts` (3 LOC): Barrel export

#### Libraries (`src/lib/`)

**API Layer** (`lib/api/`)

- `types.ts` (11 LOC): ApiClient interface, ApiResponse wrapper
- `builder.ts` (37 LOC): buildApiClient() factory function
- `client.ts` (15 LOC): Client-side API client with Zustand token
- `server.ts` (11 LOC): Server-side API client with NextAuth session
- `services/items.ts` (69 LOC): listItems(), getItem() with exhaustive type mapping via transformItem()

**Network Layer** (`lib/net/`)

- `correlation.ts` (3 LOC): generateCorrelationId() utility
- `net.ts` (52 LOC): netFetch() wrapper, ApiError class

**Auth** (`lib/auth.ts`, 47 LOC)

- NextAuth v5 configuration
- JWT strategy, credentials provider
- Callback hooks for token refresh and session

#### Configuration

**Config** (`src/config/`)

- `constants.ts` (2 LOC): API_VERSION, CORRELATION_ID_HEADER
- `env.ts` (22 LOC): Zod-validated environment variables

**Hooks** (`src/hooks/`)

- `keys.ts` (9 LOC): SWR cache key definitions
- `use-items.ts` (50 LOC): useItems(), useItem() custom hooks with service-aware SWR fetchers

**Store** (`src/store/`)

- `auth.store.ts` (13 LOC): Zustand auth state (accessToken)
- `ui.store.ts` (28 LOC): Zustand UI state (sidebar, theme, modals)

**Types** (`src/types/`)

- `api.ts` (13 LOC): PaginatedResponse, ErrorResponse types
- `content.ts` (45 LOC): ContentModel discriminated union (CourseModel, ArticleModel, EventModel, ItemModel), ItemVariant, ShelfVariant
- `next-auth.d.ts` (21 LOC): NextAuth module type augmentation

#### Utilities

- `src/lib/utils.ts` (6 LOC): cn() utility (clsx + tailwind-merge)
- `src/proxy.ts` (6 LOC): NextAuth middleware for route protection

### Root Configuration Files

**Git & Commits**

- `.husky/pre-commit`: Lint-staged hook
- `.husky/commit-msg`: Commitlint hook
- `commitlint.config.js`: Conventional commits enforcer
- `lint-staged.config.js`: Pre-commit linting rules

**Linting & Formatting**

- `eslint.config.mjs`: ESLint flat config
- `.prettierrc`: Prettier config (no semi, single quotes)
- `.prettierignore`: Prettier ignore patterns

**Dependencies & Build**

- `package.json`: pnpm workspace, all dependencies
- `next.config.ts`: Next.js minimal configuration
- `tsconfig.json`: TypeScript strict mode config
- `components.json`: shadcn/ui component registry

**Development**

- `.env.example`: Environment variable template
- `.env.local`: Local environment secrets (git-ignored)
- `.gitignore`: Standard Node.js ignores

---

## Dependency Snapshot

| Category       | Packages                                                  |
| -------------- | --------------------------------------------------------- |
| **Framework**  | next@16.2.1, react@19.2.4, react-dom@19.2.4               |
| **Auth**       | next-auth@5.0.0-beta.19, @auth/core@0.33.0                |
| **UI**         | shadcn/ui (base-nova), @base_ui/react@1.3.0, lucide-react |
| **Styling**    | tailwindcss@4, class-variance-authority, tailwind-merge   |
| **State**      | zustand@5.0.12                                            |
| **Data**       | swr@2.4.1                                                 |
| **Forms**      | react-hook-form@7.72.0, @hookform/resolvers               |
| **Validation** | zod@4.3.6                                                 |
| **Dev Tools**  | typescript@5.x, eslint, prettier, husky, commitlint       |

---

## Key Metrics

| Metric             | Value                      |
| ------------------ | -------------------------- |
| Total Files        | 79                         |
| Total Tokens       | ~20.5k                     |
| TypeScript Files   | ~45                        |
| Largest File       | globals.css (1,693 tokens) |
| Avg Component Size | ~40 LOC                    |

---

## Architecture Highlights

### Design Patterns

1. **Route Groups** — Organize pages by context (`(main)`, `(auth)`)
2. **RSC + Client Components** — Server rendering with client hydration
3. **Compound Components** — Card with sub-component slots
4. **Factory Pattern** — ItemCard dispatcher routes to type-specific cards
5. **Provider Composition** — Root providers wrap SessionProvider → SWRProvider

### Data Flow

- Server: RSC calls service (RawItem[] → ContentModel[]) → API client → netFetch
- Client: Component → SWR hook (calls service with createClientApiClient) → API client → netFetch
- State: Zustand for UI/auth, SWR for server state
- Transform: Service layer exhaustively maps type discriminant on every revalidation

### Security & Standards

- Zod schema validation for environment variables
- Correlation ID header on all API requests
- Bearer token injection in Authorization header
- NextAuth JWT with credentials provider
- TypeScript strict mode enforcement
- Conventional commits via commitlint

---

## Extending the Codebase

To add new domains:

1. Update `src/types/content.ts` with new ContentModel variant
2. Create service in `src/lib/api/services/`
3. Add SWR hook in `src/hooks/`
4. Create card component in `src/components/item/`
5. Add router case in `src/components/item/item-card.tsx`
6. Create route group in `src/app/(main)/`

See [Code Standards](./code-standards.md) for detailed patterns.
