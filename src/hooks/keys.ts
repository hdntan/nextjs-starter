// Centralized SWR cache keys — prevents fragmentation
// Convention: keys match API paths for consistency with fetcher

export const KEYS = {
  items: {
    list: '/items',
    detail: (id: string) => `/items/${id}`,
  },
} as const
