# Project Overview & Product Development Requirements

**Project Name**: next-starter
**Version**: 0.1.0
**Status**: Active Development
**Last Updated**: 2026-03-30

---

## Executive Summary

next-starter is a production-ready Next.js 16 starter template designed for mid-size teams (4–10 developers) building content-heavy catalog and marketplace UIs. It provides proven patterns for authentication, data fetching, component composition, and state management, enabling teams to focus on domain logic rather than infrastructure.

**Target**: Teams needing rapid iteration on catalog/marketplace UIs with strong typing and separation of concerns.

---

## Project Goals

### Primary Goals

1. **Accelerate onboarding** — New developers can contribute features within first week
2. **Type safety** — Zero implicit any, full discriminated unions for domain models
3. **Performance** — RSC + SWR hydration pattern eliminates hydration mismatch and loading spinners
4. **Maintainability** — Clear separation (service layer, API client, UI) reduces cognitive load
5. **Developer experience** — Pre-configured linting, formatting, commits, and hot reload

### Secondary Goals

1. Serve as reference implementation for Next.js App Router patterns
2. Provide reusable component library (Button, Card, Badge, Shelf, ItemCard)
3. Establish authentication foundation (NextAuth v5 + JWT + Zustand sync)
4. Enable rapid domain additions through clear extension points

---

## Target Users

### Primary Users

- **Mid-size teams** (4–10 developers) building SaaS platforms or content marketplaces
- **Teams familiar with** React, TypeScript, Tailwind CSS, and basic Next.js concepts
- **Use case**: Content aggregation (courses, events, articles, products)

### Secondary Users

- Enterprises migrating from legacy auth to NextAuth v5
- Teams seeking App Router reference implementation
- Developers learning modern React + TypeScript patterns

---

## Key Features

### Authentication & Authorization

- [x] NextAuth v5 (JWT-based) with credentials provider
- [x] Zustand-synced accessToken for client components
- [x] Route protection via middleware
- [x] Login form with React Hook Form + Zod validation

### Content Management

- [x] Polymorphic item cards (Course, Event, Article variants)
- [x] Discriminated union content types
- [x] Dynamic detail pages with `[slug]` routes
- [x] Shelf layouts (grid-2, grid-3, grid-4, horizontal-scroll, hero)

### Data Layer

- [x] SWR for client-side data fetching with background revalidation
- [x] RSC + SWR hydration pattern (instant render, async refresh)
- [x] Service layer abstraction (listItems, getItem functions)
- [x] Dual-context API client (server vs. client token injection)

### Developer Experience

- [x] TypeScript strict mode
- [x] Zod validation for environment variables
- [x] Husky + lint-staged pre-commit hooks
- [x] Commitlint for conventional commits
- [x] ESLint + Prettier with flat config
- [x] Correlation ID headers for request tracing

### UI/UX

- [x] shadcn/ui components (Button, Card, Input, Badge)
- [x] Base UI React integration
- [x] CVA variant system for styled components
- [x] Delayed spinner (Apple 500ms pattern)
- [x] Error boundaries and error pages
- [x] Skeleton loaders

---

## Technical Constraints

### Non-Negotiable

1. **TypeScript strict mode** — All files must pass `--strict` compiler
2. **No implicit any** — Every function must have explicit type signatures
3. **No direct fetch()** — Use API client builders, never raw fetch
4. **Zod validation** — All env vars validated at startup
5. **SWR for server state** — No server state in Zustand

### Best Practices

1. Service layer for all API calls
2. React Hook Form + Zod for forms
3. Compound components for complex UI
4. CVA for variant-heavy components
5. Discriminated unions for type safety

### Excluded Scope

- Database models/schemas (consumer responsibility)
- Actual backend implementation (example only)
- Testing framework (integrate after MVP)
- Internationalization (plugin architecture ready)

---

## API Contract

### Example: Items API

```
GET /api/items
Response: { data: Item[], total: number, page: number }

GET /api/items/:id
Response: { data: Item }

Error: { message: string, status: number, correlationId: string }
```

### Authentication Flow

```
POST /auth/login → JWT token → Zustand accessToken → Bearer header injection
```

---

## Success Metrics

| Metric              | Target                   | Current      |
| ------------------- | ------------------------ | ------------ |
| **Onboarding Time** | <1 week to first feature | Baseline TBD |
| **Build Time**      | <10s dev server start    | ~5s current  |
| **Type Coverage**   | 100% explicit types      | In progress  |
| **Test Coverage**   | >80% for critical paths  | Not started  |
| **Documentation**   | All modules documented   | 80% complete |

---

## Dependencies & Versions

| Package     | Version    | Rationale                          |
| ----------- | ---------- | ---------------------------------- |
| next        | 16.2.1     | Latest stable App Router           |
| react       | 19.2.4     | Concurrent rendering               |
| typescript  | 5.x        | Strict mode support                |
| next-auth   | 5.0.0-beta | Modern JWT approach                |
| shadcn/ui   | Latest     | Type-safe component library        |
| zustand     | 5.0.12     | Lightweight state (auth + UI only) |
| swr         | 2.4.1      | Built-in revalidation              |
| tailwindcss | 4          | Latest Tailwind with engine        |
| zod         | 4.3.6      | Runtime validation                 |

---

## Known Limitations & TODOs

### Known Limitations

1. **No image optimization** — Components assume API-provided image URLs
2. **No pagination UI** — Service layer supports offset/limit, UI doesn't consume
3. **No dark mode toggle** — UI state store prepared, no switch UI
4. **No offline support** — SWR cache only, no IndexedDB
5. **No analytics** — No event tracking infrastructure
6. **No A/B testing** — No feature flags

### Planned Enhancements

- [ ] Comprehensive test suite (unit + integration)
- [ ] E2E test scaffold with Playwright
- [ ] Dark mode toggle UI
- [ ] Pagination component
- [ ] Image optimization with Next.js Image
- [ ] Error tracking integration
- [ ] Analytics infrastructure
- [ ] PWA support (service worker)
- [ ] Storybook for component documentation
- [ ] Multi-language i18n scaffold

---

## Release Planning

### v0.1.0 (Current)

**Status**: MVP Complete

- Core auth flow (NextAuth + JWT)
- Example domain (Items + Cards + Detail page)
- Base UI component library
- Developer tooling (linting, formatting, commits)

### v0.2.0 (Next Phase)

**Goals**: Test coverage, performance monitoring

- Unit test scaffold
- E2E test examples
- Analytics integration
- Performance monitoring

### v0.3.0 (Polish)

**Goals**: Production-ready hardening

- Dark mode
- PWA support
- Error tracking
- Image optimization

---

## Architecture Decision Records (ADRs)

### ADR-001: RSC + SWR Hydration Pattern

**Decision**: Use RSC for initial page data, SWR for client-side revalidation
**Rationale**: Eliminates hydration mismatch, provides instant render + background refresh
**Consequence**: API must be called twice (server + client), adds network request

### ADR-002: Dual-Context API Client

**Decision**: `createServerApiClient()` vs. `createClientApiClient()` based on environment
**Rationale**: Separate server-side session token from client-side Zustand token
**Consequence**: Must import from `lib/api/server.ts` (RSC) or `lib/api/client.ts` (client)

### ADR-003: Discriminated Unions for Content Types

**Decision**: ContentModel union instead of generic Item interface
**Rationale**: Type safety — catch invalid property access at compile time
**Consequence**: Must add new variants to ContentModel when extending

### ADR-004: Zustand for UI State Only

**Decision**: No server state in Zustand — use SWR instead
**Rationale**: Avoids sync issues between client and server cache
**Consequence**: Must use useItems() hook, not Zustand for API data

---

## Team Structure & Responsibilities

### Suggested Roles

| Role              | Responsibilities                                   |
| ----------------- | -------------------------------------------------- |
| **Frontend Lead** | Component architecture, design system, performance |
| **Full Stack 1**  | Auth integration, API design, service layer        |
| **Full Stack 2**  | Feature development, page templates, forms         |
| **Tooling**       | Linting, testing, deployment, CI/CD                |

### Onboarding Checklist

- [ ] Clone repo, install dependencies
- [ ] Run `pnpm dev` and navigate to http://localhost:3000
- [ ] Read [Code Standards](./code-standards.md)
- [ ] Review [System Architecture](./system-architecture.md)
- [ ] Add first feature using domain extension guide
- [ ] Submit PR with linting + tests passing

---

## Communication & Support

### Documentation

- **Quickstart**: README.md
- **Architecture**: system-architecture.md
- **Code Standards**: code-standards.md
- **Codebase**: codebase-summary.md

### Getting Help

1. Check docs first
2. Review example domain (Items)
3. Examine type definitions in `src/types/`
4. Trace service → hook → component flow

---

## Version History

| Version | Date       | Changes                        |
| ------- | ---------- | ------------------------------ |
| 0.1.0   | 2026-03-30 | Initial MVP with core features |

---

## Appendix: Quick Reference

### Creating a New Domain

```
1. src/types/content.ts → Add ContentModel variant
2. src/lib/api/services/ → Create domain service
3. src/hooks/ → Add SWR hook
4. src/components/item/ → Add card component
5. src/app/(main)/ → Add page & layout
```

### Adding Authentication Flow

```
1. POST login credentials to NextAuth
2. Receive JWT token
3. Store in Zustand auth.store.accessToken
4. SessionProvider syncs to localStorage (optional)
5. API client injects Bearer token in headers
```

### Environment Variables

```
API_URL=http://localhost:5000              # Server-only
NEXT_PUBLIC_API_URL=http://localhost:3000  # Client-accessible
NEXTAUTH_SECRET=<32+ char random string>
NEXTAUTH_URL=http://localhost:3000
```
