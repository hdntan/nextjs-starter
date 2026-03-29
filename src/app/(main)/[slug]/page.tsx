// RSC — detail page "intent controller"
import { createServerApiClient } from '@/lib/api/server'
import { getItem, listItems } from '@/lib/api/services/items'
import { ItemDetail } from './_components/item-detail'
import { notFound } from 'next/navigation'
import { ApiError } from '@/lib/net/net'
import type { ItemModel } from '@/types/content'

interface DetailPageProps {
  params: Promise<{ slug: string }>
}

export default async function DetailPage({ params }: DetailPageProps) {
  const { slug } = await params
  const api = await createServerApiClient()

  let item: ItemModel
  let relatedItems: ItemModel[]

  try {
    item = await getItem(api, slug)
    relatedItems = await listItems(api)
  } catch (err) {
    // Only convert 404s to not-found; let 500s surface as errors
    if (err instanceof ApiError && err.status === 404) notFound()
    throw err
  }

  return <ItemDetail initialData={item} relatedItems={relatedItems} />
}
