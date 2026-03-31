import { api } from '@/lib/api'
import type { TrainingSession, SessionType, Intensity, Exercise } from '@/types'

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
  published_at?: string | null
}

export async function getSessions(filters: SessionFilters = {}): Promise<PaginatedSessions> {
  const params = new URLSearchParams()
  if (filters.type) params.set('type', filters.type)
  if (filters.page) params.set('page', String(filters.page))

  const qs = params.toString()
  return api.get<PaginatedSessions>(`/sessions${qs ? `?${qs}` : ''}`)
}

export async function getSessionTemplates(): Promise<{ data: TrainingSession[] }> {
  return api.get<{ data: TrainingSession[] }>('/sessions/templates')
}

export async function getSession(id: number): Promise<TrainingSession> {
  return api.get<TrainingSession>(`/sessions/${id}`)
}

export async function createSession(payload: SessionPayload): Promise<TrainingSession> {
  return api.post<TrainingSession>('/sessions', payload)
}

export async function updateSession(
  id: number,
  payload: Partial<SessionPayload>
): Promise<TrainingSession> {
  return api.patch<TrainingSession>(`/sessions/${id}`, payload)
}

export async function deleteSession(id: number): Promise<void> {
  await api.delete(`/sessions/${id}`)
}

export async function toggleParticipation(
  id: number
): Promise<{ has_participated: boolean; participants_count: number }> {
  return api.post(`/sessions/${id}/participate`, {})
}
