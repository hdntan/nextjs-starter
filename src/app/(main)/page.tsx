// RSC — acts as "intent controller" (Jet pattern)
// Fetches data on server, passes typed model to client component
import { createServerApiClient } from '@/lib/api/server'
import { listItems } from '@/lib/api/services/items'
import { ItemsCatalog } from './_components/items-catalog'

export default async function HomePage() {
  const api = await createServerApiClient()
  const items = await listItems(api)

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Home</h1>
      {/* initialData hydrates SWR on client — zero waterfall */}
      <ItemsCatalog initialData={items} />
    </div>
  )
}
