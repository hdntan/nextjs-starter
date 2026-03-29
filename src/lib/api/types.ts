export interface ApiClient {
  get<T>(path: string): Promise<T>
  post<T>(path: string, body?: unknown): Promise<T>
  put<T>(path: string, body?: unknown): Promise<T>
  delete<T>(path: string): Promise<T>
}

export interface ApiResponse<T> {
  data: T
  meta?: Record<string, unknown>
}
