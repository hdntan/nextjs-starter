import type { ContentModel, ItemVariant } from '@/types/content'
import { CourseCard } from './course-card'
import { ArticleCard } from './article-card'
import { EventCard } from './event-card'
import { GenericItemCard } from './generic-item-card'

interface ItemCardProps {
  variant: ItemVariant
  data: ContentModel
  onClick?: (data: ContentModel) => void
}

export function ItemCard({ variant, data, onClick }: ItemCardProps) {
  if (!onClick) return renderCard(variant, data)

  return (
    <div
      role="button"
      tabIndex={0}
      className="cursor-pointer"
      onClick={() => onClick(data)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault() // prevent Space from scrolling the page
          onClick(data)
        }
      }}
    >
      {renderCard(variant, data)}
    </div>
  )
}

function renderCard(variant: ItemVariant, data: ContentModel) {
  switch (data.type) {
    case 'course':
      return <CourseCard variant={variant} data={data} />
    case 'article':
      return <ArticleCard variant={variant} data={data} />
    case 'event':
      return <EventCard variant={variant} data={data} />
    case 'item':
      return <GenericItemCard variant={variant} data={data} />
    default: {
      // Exhaustive check — adding a new type to ContentModel without handling it here is a compile error
      const _exhaustive: never = data
      void _exhaustive
      return null
    }
  }
}
