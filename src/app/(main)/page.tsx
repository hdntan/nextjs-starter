// RSC — acts as "intent controller" (Jet pattern)
// Fetches data on server, passes typed model to client component
import { createServerApiClient } from '@/lib/api/server'
import { listItems } from '@/lib/api/services/items'
import { ItemsCatalog } from './_components/items-catalog'
import type { ContentModel } from '@/types/content'

export default async function HomePage() {
  const api = await createServerApiClient()

  // Gracefully degrade when backend is unavailable (e.g. during local dev without a running API)
  let items: ContentModel[] = []
  try {
    items = await listItems(api)
  } catch {
    // API unavailable — render with empty state; SWR will retry on client
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Home</h1>
      {/* initialData hydrates SWR on client — zero waterfall */}
      <ItemsCatalog initialData={items} />
    </div>
  )
}
