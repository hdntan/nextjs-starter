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
  const handleClick = onClick ? () => onClick(data) : undefined

  return (
    <div onClick={handleClick} className={onClick ? 'cursor-pointer' : undefined}>
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
