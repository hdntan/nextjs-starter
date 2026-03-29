'use client'

import { useItem } from '@/hooks/use-items'
import { Shelf } from '@/components/shelf'
import { ItemCard } from '@/components/item'
import type { ItemModel } from '@/types/content'
import Link from 'next/link'
import Image from 'next/image'

interface ItemDetailProps {
  initialData: ItemModel
  relatedItems: ItemModel[]
}

export function ItemDetail({ initialData, relatedItems }: ItemDetailProps) {
  const { item } = useItem(initialData.id, initialData)

  if (!item) return null

  return (
    <div className="space-y-8">
      <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
        Back to Home
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="aspect-video relative bg-muted rounded-lg overflow-hidden">
          {item.thumbnailUrl && (
            <Image src={item.thumbnailUrl} alt={item.title} fill className="object-cover" />
          )}
        </div>
        <div className="space-y-4">
          <h1 className="text-3xl font-bold">{item.title}</h1>
          <p className="text-muted-foreground">{item.description}</p>
          <p className="text-sm text-muted-foreground">
            Created: {new Date(item.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      {relatedItems.length > 0 && (
        <Shelf variant="horizontal-scroll" title="Related Items">
          {relatedItems
            .filter((r) => r.id !== item.id)
            .slice(0, 6)
            .map((related) => (
              <ItemCard key={related.id} variant="sm" data={related} />
            ))}
        </Shelf>
      )}
    </div>
  )
}
