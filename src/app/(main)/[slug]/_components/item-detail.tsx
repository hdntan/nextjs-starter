'use client'

import { useItem } from '@/hooks/use-items'
import { Shelf } from '@/components/shelf'
import { ItemCard } from '@/components/item'
import type { ContentModel } from '@/types/content'
import Link from 'next/link'
import Image from 'next/image'

interface ItemDetailProps {
  initialData: ContentModel
  relatedItems: ContentModel[]
}

function ItemMeta({ item }: { item: ContentModel }) {
  switch (item.type) {
    case 'course':
      return item.instructor ? (
        <p className="text-sm text-muted-foreground">Instructor: {item.instructor}</p>
      ) : null
    case 'article':
      return (
        <>
          {item.author && <p className="text-sm text-muted-foreground">By {item.author}</p>}
          {item.publishedAt && (
            <p className="text-sm text-muted-foreground">
              Published: {new Date(item.publishedAt).toLocaleDateString()}
            </p>
          )}
        </>
      )
    case 'event':
      return (
        <>
          {item.location && <p className="text-sm text-muted-foreground">{item.location}</p>}
          {item.startsAt && (
            <p className="text-sm text-muted-foreground">
              Starts: {new Date(item.startsAt).toLocaleDateString()}
            </p>
          )}
        </>
      )
    case 'item':
      return item.createdAt ? (
        <p className="text-sm text-muted-foreground">
          Created: {new Date(item.createdAt).toLocaleDateString()}
        </p>
      ) : null
  }
}

export function ItemDetail({ initialData, relatedItems }: ItemDetailProps) {
  // SWR key uses initialData.id — assumes the URL slug equals the item id.
  // If your API uses separate slug and id fields, pass slug as the SWR key instead.
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
          <ItemMeta item={item} />
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
