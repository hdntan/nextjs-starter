'use client'

// Client component — SWR hydrated with RSC initialData
import { useItems } from '@/hooks/use-items'
import { Shelf } from '@/components/shelf'
import { ItemCard } from '@/components/item'
import type { ItemModel } from '@/types/content'

interface ItemsCatalogProps {
  initialData: ItemModel[]
}

export function ItemsCatalog({ initialData }: ItemsCatalogProps) {
  // SWR hydrates instantly with initialData (fallbackData)
  // Then revalidates in background for freshness
  const { items, isLoading } = useItems(initialData)

  if (isLoading && items.length === 0) {
    return null // DelayedSpinner handled by loading.tsx
  }

  return (
    <Shelf variant="grid-3" title="All Items" cta={{ label: 'See all', href: '/items' }}>
      {items.map((item) => (
        <ItemCard key={item.id} variant="md" data={item} />
      ))}
    </Shelf>
  )
}
