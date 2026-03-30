'use client'

import useSWR from 'swr'
import { KEYS } from './keys'
import { createClientApiClient } from '@/lib/api/client'
import { listItems, getItem } from '@/lib/api/services/items'
import type { ContentModel } from '@/types/content'

/**
 * SWR hook for items list.
 *
 * RSC hydration pattern:
 *   // page.tsx (RSC)
 *   const items = await listItems(api)
 *   return <ItemsCatalog initialData={items} />
 *
 *   // ItemsCatalog.tsx ('use client')
 *   const { items } = useItems(initialData)
 *
 * The fetcher calls the service layer so transforms always apply on revalidation.
 */
export function useItems(initialData?: ContentModel[]) {
  const { data, error, isLoading, mutate } = useSWR<ContentModel[]>(
    KEYS.items.list,
    () => listItems(createClientApiClient()),
    { fallbackData: initialData }
  )

  return {
    items: data ?? [],
    isLoading,
    error,
    mutate,
  }
}

export function useItem(id: string, initialData?: ContentModel) {
  const { data, error, isLoading, mutate } = useSWR<ContentModel>(
    KEYS.items.detail(id),
    () => getItem(createClientApiClient(), id),
    { fallbackData: initialData }
  )

  return {
    item: data ?? null,
    isLoading,
    error,
    mutate,
  }
}
