# System Architecture

**Last Updated**: 2026-03-30
**Version**: 0.1.0

---

## Architecture Overview

The system follows a layered architecture with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                    Next.js App Router                        │
├─────────────────────────────────────────────────────────────┤
│  Route Groups: (main) Public  |  (auth) Authentication      │
├─────────────────────────────────────────────────────────────┤
│  Pages (RSC)  │  Layouts  │  Loading  │  Error Boundaries   │
├─────────────────────────────────────────────────────────────┤
│         React Components (Client & Server)                   │
├─────────────────────────────────────────────────────────────┤
│    State (Zustand)  │  Data (SWR)  │  Forms (RHF + Zod)     │
├─────────────────────────────────────────────────────────────┤
│    API Client Layer (Server & Client Context)                │
├─────────────────────────────────────────────────────────────┤
│         Service Functions (Pure, Typed)                      │
├─────────────────────────────────────────────────────────────┤
│     Network Layer (netFetch, ApiError, Correlation ID)       │
├─────────────────────────────────────────────────────────────┤
│              Backend API (External)                          │
└─────────────────────────────────────────────────────────────┘
```

---

## Route Architecture

### Route Groups

**Purpose**: Organize routes by context without affecting URL structure.

```
src/app/
├── (main)/              # Public content routes
│   ├── layout.tsx       # Header + Main + Footer
│   ├── page.tsx         # Home page (RSC)
│   ├── [slug]/page.tsx  # Item detail page
│   ├── error.tsx        # Error boundary
│   ├── loading.tsx      # Suspense fallback
│   └── _components/     # Route-specific components
│
├── (auth)/              # Authentication routes
│   ├── layout.tsx       # Centered layout
│   └── login/
│       ├── page.tsx     # Login page
│       └── _components/login-form.tsx
│
├── api/
│   └── auth/[...nextauth]/route.ts  # NextAuth handler
│
└── layout.tsx           # Root layout (providers)
```

### Route Execution Flow

#### Public Route (e.g., `/`)

```
GET /
  ↓
(main)/page.tsx (RSC - Server Component)
  ├── await createServerApiClient()
  ├── const items = await listItems(api)
  └── return <ItemsCatalog initialData={items} />
      ↓
      <ItemsCatalog> (Client Component, 'use client')
      ├── const { items } = useItems(initialData)
      │   └── SWR fallbackData prevents empty render
      └── return <Shelf><ItemCard /></Shelf>
```

#### Detail Route (e.g., `/courses-101`)

```
GET /courses-101
  ↓
(main)/[slug]/page.tsx (RSC)
  ├── const item = await getItem(api, slug)
  └── return <ItemDetail initialData={item} />
      ↓
      <ItemDetail> (Client Component)
      ├── const { item } = useItem(slug, initialData)
      └── return <Card><h1>{item.title}</h1></Card>
```

#### Error Handling

```
Error thrown in RSC
  ↓
(main)/error.tsx boundary
  ├── Display ErrorPage component
  └── Show error message + recovery button

Suspend (loading) in RSC
  ↓
(main)/loading.tsx boundary
  └── Show DelayedSpinner (500ms delay)

404 Not Found
  ↓
(main)/[slug]/not-found.tsx
  └── Display custom 404 UI
```

---

## Data Flow Patterns

### Pattern 1: RSC + SWR Hydration (Primary)

**Goal**: Instant render on page load, background refresh for freshness.

**Sequence**:

```
1. Server (RSC page component)
   ├── createServerApiClient() reads NextAuth session token
   ├── listItems(api) fetches and transforms RawItem[] → ContentModel[]
   └── Pass { initialData: ContentModel[] } to client component

2. Client (hydration)
   ├── useItems(initialData) mounts with SWR
   ├── SWR fetcher: listItems(createClientApiClient()) with transform on revalidation
   ├── SWR { fallbackData: initialData } prevents empty render
   ├── Browser immediately displays server data
   └── SWR revalidates in background

3. Server state update
   └── SWR refetch calls service → transforms RawItem[] → returns new ContentModel[] → component re-renders
```

**Benefits**:

- No loading spinner on page load (instant render)
- API called once on server, once on client (fresh data)
- Eliminates hydration mismatch
- SEO friendly (server renders HTML)

**Tradeoff**:

- Double API calls (server + client)
- Network cost vs. UX (acceptable for catalog UIs)

### Pattern 2: Pure Client SWR (Secondary)

**Use Case**: Interactive features, modals, user-initiated actions.

**Sequence**:

```
User clicks "Load More"
  ├── Component fires useItems() hook
  ├── SWR fetches from client
  ├── Shows loading spinner (no initial data)
  └── Displays fresh results
```

**Code Example**:

```typescript
'use client'

function MoreButton() {
  const [page, setPage] = useState(1)
  const { items } = useItems() // No initialData

  return (
    <>
      {items.map(item => <ItemCard key={item.id} {...item} />)}
      <button onClick={() => setPage(p => p + 1)}>Load More</button>
    </>
  )
}
```

---

## API Client Architecture

### Dual-Context Pattern

**Problem**: Need different token sources in server vs. client.

- **Server**: Token in NextAuth session (secure, request-scoped)
- **Client**: Token in Zustand store (memory, needs sync)

**Solution**: Two API client builders with context-aware token injection.

#### Server Context (`lib/api/server.ts`)

```typescript
// RSC only
const api = await createServerApiClient()
const items = await listItems(api)

// Reads token from:
async function createServerApiClient() {
  const session = await auth()
  const token = session?.user?.accessToken
  return buildApiClient({ token })
}
```

#### Client Context (`lib/api/client.ts`)

```typescript
// Client component only
const api = createClientApiClient()
const items = await listItems(api)

// Reads token from Zustand:
export function createClientApiClient(): ApiClient {
  return buildApiClient({
    getToken: () => useAuthStore.getState().accessToken,
  })
}
```

### API Client Builder (`lib/api/builder.ts`)

Generic factory that creates ApiClient instances:

```typescript
function buildApiClient(options: {
  token?: string | null
  getToken?: () => string | null
}): ApiClient {
  return {
    async get<T>(url: string): Promise<T> {
      const token = options.token ?? options.getToken?.()
      const response = await netFetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          'x-request-id': generateCorrelationId(),
        },
      })
      return response
    },
  }
}
```

---

## Authentication Flow

### Overview

```
User Input (Login Form)
  ↓
POST /api/auth/login (NextAuth)
  ├── Validate credentials
  ├── Generate JWT token
  └── Return { token, user }
      ↓
      Client receives token
      ├── SessionProvider syncs to Zustand (useAuthStore.setAccessToken)
      └── Store token for future API requests
          ↓
          API Client injects Bearer token
          ├── Authorization: Bearer <token>
          └── All subsequent requests authenticated
```

### Implementation

#### NextAuth Configuration (`lib/auth.ts`)

```typescript
export const authConfig: NextAuthConfig = {
  providers: [
    CredentialsProvider({
      credentials: {
        email: { type: 'text' },
        password: { type: 'password' },
      },
      async authorize(credentials) {
        const response = await fetch(`${API_URL}/login`, {
          method: 'POST',
          body: JSON.stringify(credentials),
        })
        const data = await response.json()
        return {
          id: data.user.id,
          email: data.user.email,
          accessToken: data.token, // JWT
        }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) token.accessToken = user.accessToken
      return token
    },
    session({ session, token }) {
      session.user.accessToken = token.accessToken
      return session
    },
  },
}
```

#### Session & Token Sync (`components/providers/session-provider.tsx`)

```typescript
'use client'

export function SessionProvider({ children, session }: Props) {
  useEffect(() => {
    if (session?.user?.accessToken) {
      useAuthStore.setState({ accessToken: session.user.accessToken })
    }
  }, [session])

  return (
    <SessionProvider session={session}>
      {children}
    </SessionProvider>
  )
}
```

#### Login Form Component (`app/(auth)/login/_components/login-form.tsx`)

```typescript
'use client'

export function LoginForm() {
  const router = useRouter()
  const form = useForm<LoginInput>({ resolver: zodResolver(loginSchema) })

  async function onSubmit(data: LoginInput) {
    const result = await signIn('credentials', {
      email: data.email,
      password: data.password,
      redirect: false,
    })

    if (result?.ok) {
      router.push('/') // Redirect to home
    } else {
      form.setError('root', { message: result?.error })
    }
  }

  return <form onSubmit={form.handleSubmit(onSubmit)}>{/* ... */}</form>
}
```

---

## Network Layer

### Request Pipeline

```
Component/Hook
  ↓
API Client (server or client)
  ├── Injects Authorization header (Bearer token)
  ├── Injects x-request-id header (correlation ID)
  └── Sets Content-Type: application/json
      ↓
      netFetch() wrapper
      ├── Call fetch()
      ├── Check status code
      └── If 2xx: parse JSON & return
         If 4xx/5xx: throw ApiError
            ↓
            ApiError
            ├── status (number)
            ├── message (string)
            └── correlationId (string)
                ↓
                Component error boundary
                └── Display error UI
```

### netFetch Implementation (`lib/net/net.ts`)

```typescript
export async function netFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'x-request-id': generateCorrelationId(),
      ...options?.headers,
    },
  })

  if (!response.ok) {
    const data = await response.json()
    throw new ApiError(
      response.status,
      data.message || 'Request failed',
      response.headers.get('x-request-id') || 'unknown'
    )
  }

  return response.json()
}
```

### Error Handling

**ApiError** thrown by netFetch:

```typescript
class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public correlationId: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}
```

**Catching errors in components**:

```typescript
'use client'

export function ItemList() {
  const { items, error, isLoading } = useItems()

  if (error instanceof ApiError) {
    return (
      <ErrorPage
        message={error.message}
        status={error.status}
        correlationId={error.correlationId}
      />
    )
  }

  if (isLoading) return <Skeleton />
  return items.map(item => <ItemCard key={item.id} {...item} />)
}
```

---

## State Management Architecture

### Zustand Stores

**Stores in this project**:

1. `auth.store.ts` — AccessToken only
2. `ui.store.ts` — Sidebar, theme, modals

**Rules**:

- Only UI state and auth token
- Never store API data (use SWR instead)
- Minimal, focused stores

#### Auth Store Example

```typescript
type AuthStore = {
  accessToken: string | null
  setAccessToken: (token: string) => void
  clearToken: () => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  accessToken: null,
  setAccessToken: (token) => set({ accessToken: token }),
  clearToken: () => set({ accessToken: null }),
}))
```

#### UI Store Example

```typescript
type UiStore = {
  sidebarOpen: boolean
  theme: 'light' | 'dark'
  toggleSidebar: () => void
  setTheme: (theme: 'light' | 'dark') => void
}

export const useUiStore = create<UiStore>((set) => ({
  sidebarOpen: true,
  theme: 'light',
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setTheme: (theme) => set({ theme }),
}))
```

### SWR Hooks

**Purpose**: Client-side data fetching with automatic revalidation and service-layer transform.

**Location**: `src/hooks/use-*.ts` only.

**Pattern**:

```typescript
export function useItems(initialData?: ContentModel[]) {
  const { data, error, isLoading, mutate } = useSWR<ContentModel[]>(
    KEYS.items.list,
    () => listItems(createClientApiClient()), // Fetcher calls service → applies transform
    { fallbackData: initialData }
  )
  return { items: data ?? [], error, isLoading, mutate }
}
```

**Key Point**: The fetcher calls the service function, which exhaustively transforms RawItem[] to ContentModel[] on every revalidation, ensuring type safety across the client.

---

## Component Composition Patterns

### 1. Compound Components (Card)

**Use**: Complex components with multiple related parts.

```typescript
// Definition
Card.Header = CardHeader
Card.Body = CardBody
Card.Footer = CardFooter

// Usage
<Card>
  <Card.Header>Title</Card.Header>
  <Card.Body>Content</Card.Body>
  <Card.Footer>Action</Card.Footer>
</Card>
```

### 2. Factory Pattern (ItemCard)

**Use**: Route different types to type-specific components.

```typescript
function renderCard(item: ContentModel) {
  switch (item.type) {
    case 'article': return <ArticleCard {...item} />
    case 'course': return <CourseCard {...item} />
    case 'event': return <EventCard {...item} />
  }
}

export function ItemCard({ item, variant }: ItemCardProps) {
  return (
    <article className={cn(shelfItemVariants({ variant }))}>
      {renderCard(item)}
    </article>
  )
}
```

### 3. Discriminated Unions (Type Safety)

**Use**: Ensure type safety for polymorphic data.

```typescript
type ContentModel =
  | Article & { type: 'article' }
  | Course & { type: 'course' }
  | Event & { type: 'event' }

// Type narrowing
function displayContent(item: ContentModel) {
  if (item.type === 'article') {
    return <ArticleCard content={item.content} />
  }
  // TypeScript knows item is Article here
}
```

### 4. CVA Variant System (Styling)

**Use**: Components with multiple style/size combinations.

```typescript
const buttonVariants = cva(
  'rounded-md px-4 py-2 font-medium transition',
  {
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
    defaultVariants: { variant: 'primary', size: 'md' },
  }
)

interface ButtonProps extends VariantProps<typeof buttonVariants> {
  children: React.ReactNode
}

export function Button({ variant, size, children }: ButtonProps) {
  return (
    <button className={buttonVariants({ variant, size })}>
      {children}
    </button>
  )
}
```

---

## Page Structure Pattern

### Typical Page Layout

```
src/app/(main)/page.tsx (RSC)
  ├── Fetch initial data
  ├── Handle errors
  └── Return layout + client component
      ↓
      <MainLayout>
        <Header />
        <main>
          <ClientComponent initialData={data} />
        </main>
        <Footer />
      </MainLayout>
```

### Loading States

```
src/app/(main)/loading.tsx
  └── <DelayedSpinner /> (500ms delay prevents jitter)

src/app/(main)/error.tsx
  ├── Error boundary captures errors
  └── <ErrorPage message={error.message} />

src/app/(main)/[slug]/not-found.tsx
  └── <ErrorPage status={404} />
```

---

## Type System Architecture

### Content Model (Discriminated Union)

**Purpose**: Type-safe polymorphic content handling with exhaustive type mapping.

```typescript
type ItemVariant = 'sm' | 'md' | 'lg' | 'brick'
type ShelfVariant = 'horizontal-scroll' | 'grid-2' | 'grid-3' | 'grid-4' | 'hero'

type ContentModel = CourseModel | ArticleModel | EventModel | ItemModel

interface CourseModel {
  type: 'course'
  id: string
  title: string
  description: string
  instructor: string
  thumbnailUrl: string
}

interface ArticleModel {
  type: 'article'
  id: string
  title: string
  description: string
  author: string
  publishedAt: string
  thumbnailUrl: string
}

interface EventModel {
  type: 'event'
  id: string
  title: string
  description: string
  startsAt: string
  location: string
  thumbnailUrl: string
}

interface ItemModel {
  type: 'item'
  id: string
  title: string
  description: string
  thumbnailUrl: string
  createdAt: string
}
```

**Transformation**: Service layer maps RawItem union to ContentModel via exhaustive switch with never-type check:

```typescript
// Raw from API (optional type-specific fields)
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

// Exhaustive transformation ensures all cases handled
function transformItem(raw: RawItem): ContentModel {
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
      const _exhaustive: never = raw.type // Type error if case missing
      void _exhaustive
      return { ...base, type: 'item', createdAt: raw.created_at ?? '' }
    }
  }
}
```

### API Response Types

```typescript
type ApiResponse<T> = {
  data: T
  total?: number
  page?: number
}

type PaginatedResponse<T> = {
  data: T[]
  total: number
  page: number
  pageSize: number
}

type ErrorResponse = {
  message: string
  status: number
  correlationId: string
}
```

---

## Provider Architecture

### Root Provider Composition

```typescript
// src/components/providers/index.tsx
export function Providers({ children, session }: PropsWithChildren) {
  return (
    <SessionProvider session={session}>
      <SessionSyncProvider>
        <SWRProvider>
          {children}
        </SWRProvider>
      </SessionSyncProvider>
    </SessionProvider>
  )
}
```

**Provider chain**:

1. **SessionProvider** (NextAuth) — Manages authentication session
2. **SessionSyncProvider** — Syncs NextAuth token to Zustand
3. **SWRProvider** — Configures SWR defaults

---

## Environment & Configuration

### Environment Variable Validation

```typescript
// src/config/env.ts
const envSchema = z.object({
  API_URL: z.string().url(),
  NEXT_PUBLIC_API_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(32),
  NEXTAUTH_URL: z.string().url(),
})

export const env = envSchema.parse(process.env)
```

**Server-side only** (API_URL, NEXTAUTH_SECRET):

- Used in RSC, API routes, middleware
- Never exposed to browser

**Public** (NEXT*PUBLIC*\*):

- Accessible in browser
- Safe for client-side code

---

## Middleware & Route Protection

### NextAuth Middleware (`src/proxy.ts`)

```typescript
export const config = {
  matcher: ['/((?!api|_next|public).*)'],
}

export default withAuth(
  async (req) => {
    // Protected routes logic
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
)
```

**Protects**:

- All routes under `(main)/` require authentication
- `(auth)/` routes are public
- API routes handled separately

---

## Scalability Considerations

### Current Design Handles

- Multiple content types (via discriminated unions)
- Pagination (via SWR keys with page offset)
- Real-time updates (via SWR revalidation)
- Concurrent requests (via SWR deduplication)

### Future Scalability

- Add more domains by extending ContentModel
- Implement infinite scroll with SWR pagination
- Add caching layer (via SWR config)
- Implement background sync (via Service Workers)

---

## Summary

| Layer          | Technology                | Responsibility                         |
| -------------- | ------------------------- | -------------------------------------- |
| **Routes**     | Next.js App Router        | Page structure, layout, error handling |
| **Components** | React 19                  | UI rendering, user interaction         |
| **State**      | Zustand                   | UI & auth state (minimal)              |
| **Data**       | SWR                       | Server state, revalidation             |
| **Forms**      | RHF + Zod                 | Form handling, validation              |
| **API**        | Custom builder + netFetch | Request/response, tokens, errors       |
| **Auth**       | NextAuth v5 + JWT         | Session, credentials, callbacks        |
| **Styles**     | Tailwind + CVA            | Utility-first, variant system          |
| **Types**      | TypeScript strict         | Type safety, discriminated unions      |
