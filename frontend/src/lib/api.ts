// ============================================================
// saFoulee — API Client
// ============================================================

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1'

type RequestOptions = {
  method?: string
  body?: unknown
  headers?: Record
}

class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public errors?: Record
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise {
  const { method = 'GET', body, headers = {} } = options

  // Injecter le token Bearer depuis localStorage (côté client uniquement)
  const authHeader: Record = {}
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth_token')
    if (token) authHeader['Authorization'] = `Bearer ${token}`
  }

  const config: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...authHeader,
      ...headers,
    },
  }

  if (body) {
    config.body = JSON.stringify(body)
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config)

  if (!response.ok) {
    const data = await response.json().catch(() => ({}))
    throw new ApiError(response.status, data.message ?? 'Une erreur est survenue', data.errors)
  }

  // 204 No Content
  if (response.status === 204) {
    return undefined as T
  }

  return response.json()
}

export const api = {
  get: <T>(endpoint: string) => request<T>(endpoint),
  post: <T>(endpoint: string, body?: unknown) => request<T>(endpoint, { method: 'POST', body }),
  patch: <T>(endpoint: string, body?: unknown) => request<T>(endpoint, { method: 'PATCH', body }),
  put: <T>(endpoint: string, body?: unknown) => request<T>(endpoint, { method: 'PUT', body }),
  delete: <T>(endpoint: string) => request<T>(endpoint, { method: 'DELETE' }),
}

export { ApiError }
