import type { ApiClient } from '@/lib/api/types'
import type { ItemModel } from '@/types/content'

interface RawItem {
  id: string
  title: string
  description: string
  thumbnail_url: string
  type: string
  created_at: string
}

function transformItem(raw: RawItem): ItemModel {
  return {
    id: raw.id,
    title: raw.title,
    description: raw.description,
    thumbnailUrl: raw.thumbnail_url,
    type: 'item',
    createdAt: raw.created_at,
  }
}

export async function listItems(api: ApiClient): Promise<ItemModel[]> {
  const data = await api.get<{ data: RawItem[] }>('/items')
  return data.data.map(transformItem)
}

export async function getItem(api: ApiClient, id: string): Promise<ItemModel> {
  const data = await api.get<{ data: RawItem }>(`/items/${id}`)
  return transformItem(data.data)
}
