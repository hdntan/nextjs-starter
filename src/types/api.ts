export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

export interface ErrorResponse {
  message: string
  code?: string
  details?: Record<string, unknown>
}
