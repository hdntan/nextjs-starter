# Documentation Index

Welcome to the next-starter documentation. This directory contains comprehensive guides for understanding, developing, and extending the project.

---

## Quick Navigation

### Getting Started

1. **New to the project?** Start with the [README](../README.md)
2. **Need to understand architecture?** Read [System Architecture](./system-architecture.md)
3. **Want to write code?** Review [Code Standards](./code-standards.md)
4. **Exploring the codebase?** Check [Codebase Summary](./codebase-summary.md)

---

## Documentation Files

### [Project Overview & PDR](./project-overview-pdr.md)

**Purpose**: High-level project vision and requirements.
**Contains**:

- Executive summary and project goals
- Target users and use cases
- Feature list with status
- Technical constraints
- Success metrics
- Known limitations
- Architecture decision records (ADRs)
- Team structure and onboarding

**Read if**: You want to understand "why" the project exists and what it aims to achieve.

---

### [System Architecture](./system-architecture.md)

**Purpose**: Technical architecture and design patterns.
**Contains**:

- Layered architecture overview
- Route organization (route groups, execution flow)
- Data flow patterns (RSC + SWR hydration, pure client SWR)
- API client architecture (dual-context pattern)
- Authentication flow (NextAuth + JWT + Zustand)
- Network layer (netFetch, ApiError, correlation ID)
- State management (Zustand stores, SWR hooks)
- Component composition patterns
- Type system architecture
- Provider composition
- Environment & configuration
- Middleware & route protection
- Scalability considerations

**Read if**: You need to understand how data flows through the system, how to fetch data, or how to add new features.

---

### [Code Standards](./code-standards.md)

**Purpose**: Development conventions and best practices.
**Contains**:

- Core principles (type safety, simplicity, DRY)
- File naming and organization
- TypeScript standards (types, discriminated unions, generics)
- Component standards (RSC, client components, hooks)
- State management patterns
- API layer standards
- Naming conventions
- Form standards (React Hook Form + Zod)
- CSS & styling (Tailwind, CVA)
- Environment variables
- Commit conventions
- Testing standards
- Documentation standards
- Import organization
- Performance standards
- Security standards
- Error handling
- Linting & formatting
- Quick checklist

**Read before**: Writing any code. Use as a reference during development.

---

### [Codebase Summary](./codebase-summary.md)

**Purpose**: File-by-file breakdown of the codebase.
**Contains**:

- Overview (version, language, framework)
- Complete file organization with LOC counts
- Dependency snapshot
- Key metrics
- Architecture highlights
- Extending the codebase guide

**Read if**: You want to understand what files exist, where they are, and what they do.

---

### [Project Roadmap](./project-roadmap.md)

**Purpose**: Future plans and release schedule.
**Contains**:

- Version timeline (v0.1.0 through v1.0.0+)
- Phase descriptions with tasks and success criteria
- Known issues and TODOs
- Planned breaking changes
- Dependency upgrade schedule
- Performance goals
- Security roadmap
- Team capacity planning
- Metrics & success indicators
- Communication plan

**Read if**: You want to know what's coming next, contribute to planning, or understand long-term vision.

---

## Common Tasks

### I want to...

#### Add a new content type (Course, Event, etc.)

1. Read [System Architecture → Component Composition Patterns](./system-architecture.md#component-composition-patterns)
2. Follow [Code Standards → Naming Conventions](./code-standards.md#naming-conventions)
3. Check [Code Standards → Component Standards](./code-standards.md#component-standards)
4. Use [Codebase Summary → Extending the Codebase](./codebase-summary.md#extending-the-codebase)

#### Fix an API request issue

1. Read [System Architecture → Network Layer](./system-architecture.md#network-layer)
2. Check [System Architecture → API Client Architecture](./system-architecture.md#api-client-architecture)
3. Review [Code Standards → API Layer Standards](./code-standards.md#api-layer-standards)

#### Understand authentication

1. Read [System Architecture → Authentication Flow](./system-architecture.md#authentication-flow)
2. Check [Project Overview → Technical Constraints](./project-overview-pdr.md#technical-constraints)
3. Review the login component in codebase

#### Optimize performance

1. Read [Project Roadmap → Performance Goals](./project-roadmap.md#performance-goals)
2. Check [Code Standards → Performance Standards](./code-standards.md#performance-standards)
3. Review [System Architecture → RSC + SWR Hydration](./system-architecture.md#pattern-1-rsc--swr-hydration-primary)

#### Write a test

1. Read [Code Standards → Testing Standards](./code-standards.md#testing-standards)
2. Check [Project Roadmap → v0.2.0](./project-roadmap.md#v020---testing--monitoring)

#### Add environment variables

1. Read [Code Standards → Environment Variables](./code-standards.md#environment-variables)
2. Update `.env.example`
3. Update `src/config/env.ts`

---

## Key Concepts

### Route Groups

Parenthesized route folders like `(main)` and `(auth)` that organize routes by context without affecting URLs.

### RSC + SWR Hydration

Server renders initial data, client fetches fresh data in background with SWR caching—eliminates loading spinner and hydration mismatch.

### Discriminated Unions

Type-safe way to handle multiple content types (Article, Course, Event) with compile-time safety.

### Dual-Context API Client

Two API client builders: `createServerApiClient()` (reads NextAuth token) and `createClientApiClient()` (reads Zustand token).

### Compound Components

Complex components split into sub-components (Card.Header, Card.Body) for composability.

### CVA (Class Variance Authority)

Type-safe styling system for components with multiple size/variant combinations.

### Zustand Stores

Lightweight state management for UI and auth state (never API data).

---

## Architecture Decision Records (ADRs)

Key decisions made during development:

1. **ADR-001**: RSC + SWR Hydration Pattern
2. **ADR-002**: Dual-Context API Client
3. **ADR-003**: Discriminated Unions for Content Types
4. **ADR-004**: Zustand for UI State Only

See [Project Overview & PDR → Architecture Decision Records](./project-overview-pdr.md#architecture-decision-records-adrs)

---

## Development Workflow

### Before Writing Code

1. Read [Code Standards](./code-standards.md) (5 min)
2. Review relevant architectural pattern in [System Architecture](./system-architecture.md) (10 min)
3. Check [Codebase Summary](./codebase-summary.md) for similar examples (5 min)

### While Writing Code

1. Follow file naming conventions
2. Use TypeScript strict mode (no implicit any)
3. Keep components under 200 LOC
4. Add tests for critical paths
5. Run `pnpm lint:fix` before commit

### Before Submitting PR

1. Check [Code Standards → Quick Checklist](./code-standards.md#quick-checklist)
2. Run `pnpm lint`, `pnpm format:check`, `pnpm typecheck`
3. Ensure commit message follows conventional format
4. Add documentation for new APIs/components

---

## Useful Commands

```bash
# Development
pnpm dev              # Start dev server
pnpm build            # Production build

# Linting & Formatting
pnpm lint             # ESLint check
pnpm lint:fix         # ESLint auto-fix
pnpm format           # Prettier write
pnpm format:check     # Prettier check
pnpm typecheck        # TypeScript check

# Testing (v0.2.0+)
pnpm test             # Run tests
pnpm test:watch       # Watch mode
pnpm test:coverage    # Coverage report
```

---

## Getting Help

1. **Type-related questions**: Check [Code Standards → TypeScript Standards](./code-standards.md#typescript-standards)
2. **Architecture questions**: Check [System Architecture](./system-architecture.md)
3. **API/data fetching**: Check [System Architecture → API Client Architecture](./system-architecture.md#api-client-architecture)
4. **Component patterns**: Check [System Architecture → Component Composition Patterns](./system-architecture.md#component-composition-patterns)
5. **Naming conventions**: Check [Code Standards → Naming Conventions](./code-standards.md#naming-conventions)

---

## Contributing

See your team's contribution guidelines (to be added to project root).

Key principles:

- Type safety first (TypeScript strict)
- Simplicity over cleverness (KISS)
- No code duplication (DRY)
- Self-documenting code
- Clear separation of concerns

---

## Documentation Maintenance

These docs are kept in sync with the codebase. If you notice:

- Outdated information
- Missing examples
- Broken links
- Unclear explanations

Please create an issue or submit a PR to fix it.

---

## Last Updated

2026-03-30 (v0.1.0 initial documentation)

For changes in newer versions, see [Project Roadmap](./project-roadmap.md).
