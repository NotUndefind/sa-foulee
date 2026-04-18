import { api } from '@/lib/api'
import type { TrainingSession, SessionType, Intensity, Exercise, Location } from '@/types'

export interface PaginatedSessions {
  data: TrainingSession[]
  meta: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}

export interface SessionFilters {
  type?: SessionType | ''
  page?: number
}

export interface SessionPayload {
  title: string
  type: SessionType
  distance_km?: number | null
  duration_min?: number | null
  intensity: Intensity
  exercises?: Exercise[]
  description?: string
  is_template?: boolean
  location_id?: number | null
  session_date?: string | null
}

export async function getSessions(filters: SessionFilters = {}): Promise {
  const params = new URLSearchParams()
  if (filters.type) params.set('type', filters.type)
  if (filters.page) params.set('page', String(filters.page))

  const qs = params.toString()
  return api.get<PaginatedSessions>(`/sessions${qs ? `?${qs}` : ''}`)
}

export async function getSessionTemplates(): Promise {
  return api.get<{ data: TrainingSession[] }>('/sessions/templates')
}

export async function getSession(id: number): Promise {
  return api.get<TrainingSession>(`/sessions/${id}`)
}

export async function createSession(payload: SessionPayload): Promise {
  return api.post<TrainingSession>('/sessions', payload)
}

export async function updateSession(id: number, payload: Partial): Promise {
  return api.patch<TrainingSession>(`/sessions/${id}`, payload)
}

export async function deleteSession(id: number): Promise {
  await api.delete(`/sessions/${id}`)
}

export async function toggleParticipation(id: number): Promise {
  return api.post(`/sessions/${id}/participate`, {})
}

// ---- Lieux favoris ----

export async function getLocations(): Promise {
  return api.get<{ data: Location[] }>('/locations')
}

export async function createLocation(name: string): Promise {
  return api.post<Location>('/locations', { name })
}

export async function deleteLocation(id: number): Promise {
  await api.delete(`/locations/${id}`)
}
