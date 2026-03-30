import type { ApiClient } from '@/lib/api/types'
import type { ContentModel } from '@/types/content'

// Raw shape from API — all type-specific fields are optional
// Replace field names to match your actual backend contract
interface RawItem {
  id: string
  type: 'course' | 'article' | 'event' | 'item'
  title: string
  description: string
  thumbnail_url: string
  // ItemModel
  created_at?: string
  // CourseModel
  instructor?: string
  // ArticleModel
  author?: string
  published_at?: string
  // EventModel
  starts_at?: string
  location?: string
}

function transformItem(raw: RawItem): ContentModel {
  const base = {
    id: raw.id,
    title: raw.title,
    description: raw.description,
    thumbnailUrl: raw.thumbnail_url,
  }

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
      return {
        ...base,
        type: 'event',
        startsAt: raw.starts_at ?? '',
        location: raw.location ?? '',
      }
    case 'item':
      return { ...base, type: 'item', createdAt: raw.created_at ?? '' }
    default: {
      // Exhaustive check — unhandled raw.type values produce a compile error here
      const _exhaustive: never = raw.type
      void _exhaustive
      return { ...base, type: 'item', createdAt: raw.created_at ?? '' }
    }
  }
}

export async function listItems(api: ApiClient): Promise<ContentModel[]> {
  const data = await api.get<{ data: RawItem[] }>('/items')
  return data.data.map(transformItem)
}

export async function getItem(api: ApiClient, id: string): Promise<ContentModel> {
  const data = await api.get<{ data: RawItem }>(`/items/${id}`)
  return transformItem(data.data)
}
