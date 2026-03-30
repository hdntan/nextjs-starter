# Code Standards & Conventions

**Last Updated**: 2026-03-30
**Applies To**: All TypeScript, TSX, and configuration files

---

## Core Principles

1. **Type Safety First** — TypeScript strict mode, no implicit any
2. **Simplicity Over Cleverness** — KISS principle, easy to understand code
3. **No Code Duplication** — DRY principle, extract reusable patterns
4. **Self-Documenting** — Clear names, minimal comments needed
5. **Separation of Concerns** — Service → API → UI layers

---

## File Naming & Organization

### File Naming Convention

- **Format**: kebab-case with descriptive purpose
- **Components**: `feature-name.tsx`
- **Hooks**: `use-feature-name.ts`
- **Utilities**: `utility-name.ts`
- **Services**: `domain.ts`
- **Types**: `type-name.ts`
- **Stores**: `store-name.store.ts`

### Examples

| File                | Purpose                      |
| ------------------- | ---------------------------- |
| `items-catalog.tsx` | Items listing component      |
| `use-items.ts`      | Items fetching hook          |
| `item-card.tsx`     | Item display card            |
| `items.ts`          | Items API service            |
| `auth.store.ts`     | Authentication Zustand store |

### Directory Structure Rules

```
src/
├── app/              # Next.js routes (route groups in parentheses)
├── components/       # Reusable components (ui/, layout/, item/, shelf/)
├── hooks/            # Custom hooks (SWR-based data hooks)
├── lib/              # Libraries (api/, net/, auth, utils)
├── store/            # Zustand state stores
├── config/           # Config files (env, constants)
├── types/            # TypeScript type definitions
└── proxy.ts          # NextAuth middleware
```

### Co-located Components

- `_components/` folder for route-specific components
- Example: `src/app/(main)/[slug]/_components/item-detail.tsx`
- Never export from `_components/` outside the route

### Barrel Exports

Use `index.ts` for barrel exports in shared component groups:

```typescript
// src/components/item/index.ts
export { ItemCard } from './item-card'
export { GenericItemCard } from './generic-item-card'
export { CourseCard } from './course-card'
```

---

## TypeScript Standards

### Type Declarations

#### No Implicit Any

```typescript
// BAD
function processItem(item) {
  /* ... */
}

// GOOD
function processItem(item: ContentItem): void {
  /* ... */
}
```

#### Explicit Return Types

```typescript
// BAD
const getItemName = (item) => item.name

// GOOD
const getItemName = (item: ContentItem): string => item.name
```

#### Type Aliases vs. Interfaces

- Use `type` for unions and discriminated unions (primary)
- Use `interface` for object extension patterns
- Prefer `type` for consistency in this codebase

```typescript
// Discriminated union (use type)
type ContentModel = Article | Course | Event

// Object with fields (use type for consistency)
type ApiResponse<T> = { data: T; status: number }
```

### Discriminated Unions

All content types must use discriminated unions with exhaustive type mapping:

```typescript
// GOOD - interface per variant
interface ArticleModel { type: 'article'; id: string; title: string; author: string; publishedAt: string }
interface CourseModel { type: 'course'; id: string; title: string; instructor: string }
interface EventModel { type: 'event'; id: string; title: string; startsAt: string; location: string }

type ContentModel = ArticleModel | CourseModel | EventModel

// Service layer transforms with exhaustive switch
function transformItem(raw: RawItem): ContentModel {
  switch (raw.type) {
    case 'article': return { type: 'article', id: raw.id, author: raw.author ?? '' }
    case 'course': return { type: 'course', id: raw.id, instructor: raw.instructor ?? '' }
    case 'event': return { type: 'event', id: raw.id, startsAt: raw.starts_at ?? '' }
    default: {
      const _exhaustive: never = raw.type  // Compile error if case missing
      void _exhaustive
      throw new Error(`Unhandled type: ${raw.type}`)
    }
  }
}

// Type narrowing in components
function renderContent(item: ContentModel) {
  switch (item.type) {
    case 'article': return <ArticleCard {...item} />
    case 'course': return <CourseCard {...item} />
    case 'event': return <EventCard {...item} />
  }
}
```

### Generics

Use generics for reusable patterns:

```typescript
type ApiResponse<T> = {
  data: T
  total: number
  page: number
}

interface ApiClient {
  get<T>(url: string): Promise<T>
  post<T>(url: string, body: unknown): Promise<T>
}
```

---

## Component Standards

### React Server Components (RSC)

#### Page Components

- `src/app/(route)/page.tsx` — Server component by default
- Fetch data on server using `createServerApiClient()`
- Pass initial data to client component
- Add error boundary, loading state, not-found page

```typescript
// src/app/(main)/page.tsx
export default async function HomePage() {
  const api = await createServerApiClient()
  const items = await listItems(api)
  return <ItemsCatalog initialData={items} />
}
```

#### Layout Components

- Can be server or client (prefer server if no interactivity)
- Provide children through props

```typescript
export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <Header />
      <main>{children}</main>
      <Footer />
    </div>
  )
}
```

#### Error & Loading States

- `error.tsx` — Error boundary component
- `loading.tsx` — Suspense fallback (use DelayedSpinner)
- `not-found.tsx` — 404 boundary

```typescript
// src/app/(main)/loading.tsx
export default function Loading() {
  return <DelayedSpinner />
}
```

### Client Components

#### Component Definition

- Add `'use client'` directive at top of file if using hooks
- Use clear component names (PascalCase)
- Export as named export

```typescript
'use client'

interface ItemCardProps {
  item: ContentItem
  variant: 'sm' | 'md' | 'lg'
}

export function ItemCard({ item, variant }: ItemCardProps) {
  // component body
}
```

#### Props Interface

- Define props interface above component
- Prefer destructuring in parameters
- Optional props should have defaults

```typescript
// GOOD
interface ButtonProps {
  label: string
  onClick: () => void
  variant?: 'primary' | 'secondary'
  disabled?: boolean
}

export function Button({ label, onClick, variant = 'primary', disabled = false }: ButtonProps) {
  // ...
}
```

#### Hooks in Components

- Only client components can use hooks
- Extract data-fetching logic to custom hooks
- Never call hooks conditionally

```typescript
'use client'

export function ItemList() {
  const { items, isLoading } = useItems() // Custom hook in src/hooks/

  if (isLoading) return <Skeleton />
  return items.map(item => <ItemCard key={item.id} item={item} />)
}
```

#### Compound Components

Use compound component pattern for complex UI:

```typescript
// Card compound component
export function Card({ children }: { children: React.ReactNode }) {
  return <div className="rounded-lg border">{children}</div>
}

Card.Header = function CardHeader({ children }: { children: React.ReactNode }) {
  return <div className="border-b p-4">{children}</div>
}

Card.Body = function CardBody({ children }: { children: React.ReactNode }) {
  return <div className="p-4">{children}</div>
}

// Usage
<Card>
  <Card.Header>Title</Card.Header>
  <Card.Body>Content</Card.Body>
</Card>
```

---

## State Management

### Zustand Stores

- **Use for**: UI state (sidebar, theme, modals), auth token
- **Never use for**: Server state, API data

#### Store Definition

```typescript
// src/store/auth.store.ts
import { create } from 'zustand'

type AuthStore = {
  accessToken: string | null
  setAccessToken: (token: string) => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  accessToken: null,
  setAccessToken: (token: string) => set({ accessToken: token }),
}))
```

#### Store Usage in Components

```typescript
'use client'

export function Header() {
  const token = useAuthStore((state) => state.accessToken)
  const setToken = useAuthStore((state) => state.setAccessToken)

  return <header>{token ? 'Authenticated' : 'Guest'}</header>
}
```

### SWR Hooks

- **Use for**: Server state (API data)
- **Location**: `src/hooks/use-*.ts` files only
- **Never inline** SWR in components

#### Hook Definition

```typescript
// src/hooks/use-items.ts
import useSWR from 'swr'
import { KEYS } from './keys'
import { createClientApiClient } from '@/lib/api/client'
import { listItems, getItem } from '@/lib/api/services/items'
import type { ContentModel } from '@/types/content'

/**
 * The fetcher calls the service function, which applies transformation on every revalidation.
 * Ensures type safety and fresh data after background sync.
 */
export function useItems(initialData?: ContentModel[]) {
  const { data, error, isLoading, mutate } = useSWR<ContentModel[]>(
    KEYS.items.list,
    () => listItems(createClientApiClient()),
    { fallbackData: initialData }
  )

  return { items: data ?? [], error, isLoading, mutate }
}

export function useItem(id: string, initialData?: ContentModel) {
  const { data, error, isLoading, mutate } = useSWR<ContentModel>(
    KEYS.items.detail(id),
    () => getItem(createClientApiClient(), id),
    { fallbackData: initialData }
  )

  return { item: data ?? null, error, isLoading, mutate }
}
```

#### Hook Usage in Components

```typescript
'use client'

import { useItems } from '@/hooks/use-items'
import { ItemCard } from '@/components/item'
import type { ContentModel } from '@/types/content'

export function ItemsCatalog({ initialData }: { initialData: ContentModel[] }) {
  const { items, isLoading, error } = useItems(initialData)

  if (error) return <ErrorPage message={error.message} />
  return items.map(item => <ItemCard key={item.id} item={item} />)
}
```

---

## API Layer Standards

### Service Functions

- Location: `src/lib/api/services/{domain}.ts`
- Pure functions that call API client
- Responsible for API→domain transformation (raw → typed)
- No side effects
- Return transformed, typed data

```typescript
// src/lib/api/services/items.ts
import { ApiClient } from '../types'
import type { ContentModel } from '@/types/content'

// Raw shape from API with optional type-specific fields
interface RawItem {
  id: string
  type: 'course' | 'article' | 'event' | 'item'
  title: string
  description: string
  thumbnail_url: string
  instructor?: string
  author?: string
  published_at?: string
  starts_at?: string
  location?: string
  created_at?: string
}

// Exhaustive transform with never-type safety check
function transformItem(raw: RawItem): ContentModel {
  const base = {
    id: raw.id,
    title: raw.title,
    description: raw.description,
    thumbnailUrl: raw.thumbnail_url,
  }
  switch (raw.type) {
    case 'course':
      return { ...base, type: 'course', instructor: raw.instructor ?? '' }
    case 'article':
      return {
        ...base,
        type: 'article',
        author: raw.author ?? '',
        publishedAt: raw.published_at ?? '',
      }
    case 'event':
      return { ...base, type: 'event', startsAt: raw.starts_at ?? '', location: raw.location ?? '' }
    case 'item':
      return { ...base, type: 'item', createdAt: raw.created_at ?? '' }
    default: {
      const _exhaustive: never = raw.type
      void _exhaustive
      throw new Error(`Unhandled type: ${raw.type}`)
    }
  }
}

export async function listItems(api: ApiClient): Promise<ContentModel[]> {
  const data = await api.get<{ data: RawItem[] }>('/items')
  return data.data.map(transformItem)
}

export async function getItem(api: ApiClient, id: string): Promise<ContentModel> {
  const data = await api.get<{ data: RawItem }>(`/items/${id}`)
  return transformItem(data.data)
}
```

### API Client Usage

```typescript
// Server component (RSC)
import { createServerApiClient } from '@/lib/api/server'

const api = await createServerApiClient()
const items = await listItems(api)

// Client component
import { createClientApiClient } from '@/lib/api/client'

const api = createClientApiClient()
const items = await listItems(api)
```

### Error Handling

- Throw `ApiError` from `netFetch()`
- Catch in higher layers (hooks, components)
- Always provide error UI fallback

```typescript
try {
  const items = await listItems(api)
} catch (error) {
  if (error instanceof ApiError) {
    return <ErrorPage message={error.message} status={error.status} />
  }
  return <ErrorPage message="Unknown error" />
}
```

---

## Naming Conventions

### Variables & Functions

- **camelCase** for variables, functions, properties
- **PascalCase** for React components, classes, types
- **UPPER_CASE** for constants

```typescript
// Variables
const userEmail = 'user@example.com'
const itemCount = 10

// Functions
function getUserEmail(): string {}
const formatDate = (date: Date): string => {}

// Components
export function ItemCard() {}
export function EditUserForm() {}

// Types
type ContentModel = {}
interface ApiResponse {}

// Constants
const API_VERSION = 'v1'
const DEFAULT_PAGE_SIZE = 10
```

### Boolean Variables

- Prefix with `is`, `has`, `can`, `should`

```typescript
const isLoading = false
const hasError = true
const canDelete = user.role === 'admin'
const shouldRefetch = data.staleTime > maxAge
```

### CSS Classes

- Use **kebab-case** in className strings
- Use `cn()` utility for conditionals

```typescript
import { cn } from '@/lib/utils'

export function Button({ disabled, variant }: ButtonProps) {
  return (
    <button className={cn(
      'rounded-md px-4 py-2',
      variant === 'primary' && 'bg-blue-600 text-white',
      disabled && 'opacity-50 cursor-not-allowed'
    )}>
      Click
    </button>
  )
}
```

---

## Form Standards

### React Hook Form + Zod

#### Form Schema

```typescript
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be 8+ chars'),
})

type LoginInput = z.infer<typeof loginSchema>
```

#### Form Component

```typescript
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

export function LoginForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = (data: LoginInput) => {
    // Handle submission
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email')} />
      {errors.email && <span>{errors.email.message}</span>}
      <button type="submit">Login</button>
    </form>
  )
}
```

---

## CSS & Styling

### Tailwind CSS

- Use utility-first approach
- Keep component styles in className (not separate CSS)
- Use `cn()` for conditional classes

```typescript
import { cn } from '@/lib/utils'

interface CardProps {
  highlighted?: boolean
  children: React.ReactNode
}

export function Card({ highlighted, children }: CardProps) {
  return (
    <div className={cn(
      'rounded-lg border bg-white p-4',
      highlighted && 'border-blue-500 shadow-lg'
    )}>
      {children}
    </div>
  )
}
```

### Class Variance Authority (CVA)

For components with multiple variants:

```typescript
import { cva, type VariantProps } from 'class-variance-authority'

const buttonVariants = cva('rounded-md px-4 py-2 font-medium', {
  variants: {
    variant: {
      primary: 'bg-blue-600 text-white hover:bg-blue-700',
      secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
    },
    size: {
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg',
    },
  },
  defaultVariants: {
    variant: 'primary',
    size: 'md',
  },
})

interface ButtonProps extends VariantProps<typeof buttonVariants> {
  children: React.ReactNode
  onClick?: () => void
}

export function Button({ variant, size, children, onClick }: ButtonProps) {
  return (
    <button className={buttonVariants({ variant, size })} onClick={onClick}>
      {children}
    </button>
  )
}
```

---

## Environment Variables

### Zod Schema Validation

All env vars validated at startup:

```typescript
// src/config/env.ts
import { z } from 'zod'

const envSchema = z.object({
  API_URL: z.string().url(),
  NEXT_PUBLIC_API_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(32),
  NEXTAUTH_URL: z.string().url(),
})

const env = envSchema.parse(process.env)

export const config = {
  apiUrl: env.API_URL,
  publicApiUrl: env.NEXT_PUBLIC_API_URL,
  nextAuthSecret: env.NEXTAUTH_SECRET,
  nextAuthUrl: env.NEXTAUTH_URL,
}
```

### Usage

```typescript
import { config } from '@/config/env'

const apiUrl = config.apiUrl
```

---

## Commit Standards

### Conventional Commits

Format: `type(scope): subject`

**Types**: feat, fix, docs, style, refactor, test, chore, ci

**Examples**:

```
feat(auth): add JWT token refresh
fix(items): handle null image URLs
docs(readme): update quick start guide
chore(deps): upgrade next to v16.3
```

### Rules

- No semicolons at end
- Lowercase subject
- Imperative mood ("add" not "adds" or "added")
- Max 72 chars subject line
- Enforced by commitlint pre-commit hook

---

## Testing Standards

### Unit Tests

- Location: `src/**/__tests__/*.test.ts(x)`
- Test file naming: `component-name.test.tsx`
- Coverage target: >80% for critical paths

### Integration Tests

- Location: `tests/integration/`
- Test data flows end-to-end
- Mock API layer, not components

### E2E Tests

- Location: `tests/e2e/`
- Use Playwright
- Test user workflows (login, browse, detail view)

---

## Documentation Standards

### Code Comments

- Only for "why", not "what"
- Keep self-documenting function names
- Use TSDoc for exported functions

```typescript
// GOOD - explains why
const DELAY_MS = 500 // Apple pattern: delay spinner to avoid jitter on fast loads

// BAD - states the obvious
const items = [] // array for items

/**
 * Fetches items from the API with optional filtering.
 * @param api - The API client instance
 * @param filter - Optional filter parameters
 * @returns Promise resolving to array of items
 */
export async function listItems(api: ApiClient, filter?: Filter): Promise<Item[]> {
  // ...
}
```

### README for Domains

- Brief description
- Props interface
- Usage example
- Known limitations

---

## Import Organization

Order imports by:

1. External packages (react, next, etc.)
2. Internal utilities (@/, ~/)
3. Types
4. Blank line between groups

```typescript
import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { ItemCard } from '@/components/item'
import { useItems } from '@/hooks/use-items'
import { cn } from '@/lib/utils'

import type { Item } from '@/types/content'
```

---

## Performance Standards

### Image Loading

- Always use Next.js Image component
- Set width/height to prevent layout shift
- Use placeholder="blur" for large images

### Data Fetching

- Use SWR with revalidation
- Set appropriate stale times
- Implement error fallbacks

### Bundle Size

- Monitor with `next/image` and `@next/bundle-analyzer`
- Keep component files under 200 LOC
- Extract large utilities to separate files

---

## Security Standards

### Secrets Management

- Never commit `.env.local`
- Use GitHub Secrets for CI/CD
- Validate env vars with Zod at startup
- No hardcoded API keys

### Type Safety

- Always validate user input (forms with Zod)
- Use Content Security Policy headers
- Sanitize markdown/HTML content (if needed)

### CORS & API Security

- API client injects correlation ID
- Bearer token in Authorization header
- Service layer handles token refresh

---

## Error Handling

### Try-Catch Pattern

```typescript
try {
  const data = await fetchData()
} catch (error) {
  if (error instanceof ApiError) {
    console.error(`API error: ${error.status} - ${error.message}`)
  } else if (error instanceof Error) {
    console.error(`Unexpected error: ${error.message}`)
  }
  // Provide user-facing fallback
  return <ErrorPage />
}
```

### Error Boundaries

- Use Next.js `error.tsx` for RSC errors
- Wrap client components with error boundary (optional)
- Always provide recovery UI

---

## Linting & Formatting

### ESLint

Run: `pnpm lint` to check
Run: `pnpm lint:fix` to auto-fix

Config: `eslint.config.mjs` (flat config)

### Prettier

Run: `pnpm format` to write
Run: `pnpm format:check` to verify

Config: `.prettierrc`

- No semicolons
- Single quotes
- Print width: 100 chars
- Trailing commas in ES5

### Pre-commit Hook

Automatically runs lint-staged on staged files:

- ESLint fix
- Prettier format

Override with `--no-verify` (discouraged)

---

## Useful Commands

```bash
pnpm lint              # ESLint check
pnpm lint:fix          # ESLint auto-fix
pnpm format            # Prettier write
pnpm format:check      # Prettier check
pnpm typecheck         # TypeScript check
pnpm dev               # Development server
pnpm build             # Production build
pnpm start             # Production server
```

---

## Quick Checklist

Before submitting a PR:

- [ ] TypeScript strict mode passes
- [ ] ESLint and Prettier pass
- [ ] No console.log or commented code
- [ ] All functions have explicit types
- [ ] No implicit any usage
- [ ] Error handling implemented
- [ ] Discriminated unions used for unions
- [ ] API calls only in services
- [ ] SWR hooks only in `src/hooks/`
- [ ] Zustand only for UI state
- [ ] Component file under 200 LOC
- [ ] Commit message follows conventional format
