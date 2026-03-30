// -- Variant types (exhaustive from day one) --
export type ShelfVariant = 'horizontal-scroll' | 'grid-2' | 'grid-3' | 'grid-4' | 'hero'
export type ItemVariant = 'sm' | 'md' | 'lg' | 'brick'

// -- Content model discriminated union --
export interface CourseModel {
  type: 'course'
  id: string
  title: string
  description: string
  instructor: string
  thumbnailUrl: string
}

export interface ArticleModel {
  type: 'article'
  id: string
  title: string
  description: string
  author: string
  publishedAt: string
  thumbnailUrl: string
}

export interface EventModel {
  type: 'event'
  id: string
  title: string
  description: string
  startsAt: string
  location: string
  thumbnailUrl: string
}

export interface ItemModel {
  type: 'item'
  id: string
  title: string
  description: string
  thumbnailUrl: string
  createdAt: string
}

export type ContentModel = CourseModel | ArticleModel | EventModel | ItemModel
