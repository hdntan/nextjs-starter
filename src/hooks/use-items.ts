'use client'

import useSWR from 'swr'
import { KEYS } from './keys'
import type { ItemModel } from '@/types/content'

/**
 * SWR hook for items list.
 *
 * Usage in client component:
 *   const { items, isLoading, error } = useItems(initialData)
 *
 * RSC hydration pattern:
 *   // page.tsx (RSC)
 *   const items = await listItems(api)
 *   return <ItemsCatalog initialData={items} />
 *
 *   // ItemsCatalog.tsx ('use client')
 *   const { items } = useItems(initialData)
 */
export function useItems(initialData?: ItemModel[]) {
  const { data, error, isLoading, mutate } = useSWR<ItemModel[]>(
    KEYS.items.list,
    null, // uses global fetcher from SWRProvider
    {
      fallbackData: initialData,
    }
  )

  return {
    items: data ?? [],
    isLoading,
    error,
    mutate,
  }
}

export function useItem(id: string, initialData?: ItemModel) {
  const { data, error, isLoading, mutate } = useSWR<ItemModel>(KEYS.items.detail(id), null, {
    fallbackData: initialData,
  })

  return {
    item: data ?? null,
    isLoading,
    error,
    mutate,
  }
}
