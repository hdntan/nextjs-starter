'use client'

// Client component — SWR hydrated with RSC initialData
import { useItems } from '@/hooks/use-items'
import { Shelf } from '@/components/shelf'
import { ItemCard } from '@/components/item'
import type { ContentModel } from '@/types/content'

interface ItemsCatalogProps {
  initialData: ContentModel[]
}

export function ItemsCatalog({ initialData }: ItemsCatalogProps) {
  // SWR hydrates instantly with initialData (fallbackData)
  // Then revalidates in background for freshness
  const { items, isLoading, error } = useItems(initialData)

  if (isLoading && items.length === 0) {
    return null // DelayedSpinner handled by loading.tsx
  }

  return (
    <div className="space-y-2">
      {error && (
        <p className="text-sm text-muted-foreground">
          Could not refresh data. Showing last known results.
        </p>
      )}
      <Shelf variant="grid-3" title="All Items">
        {items.map((item) => (
          <ItemCard key={item.id} variant="md" data={item} />
        ))}
      </Shelf>
    </div>
  )
}
