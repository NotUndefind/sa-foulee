import { api } from '@/lib/api'
import type { Event, EventPhoto, EventType } from '@/types'

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1'

export interface PaginatedEvents {
  data: Event[]
  meta: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}

export interface EventFilters {
  type?: EventType | ''
  upcoming?: boolean
  past?: boolean
  page?: number
  per_page?: number
}

export interface EventPayload {
  title: string
  description: string
  type: EventType
  event_date: string   // ISO string
  location: string
  is_public: boolean
}

export async function getEvents(filters: EventFilters = {}): Promise<PaginatedEvents> {
  const params = new URLSearchParams()
  if (filters.type)                   params.set('type', filters.type)
  if (filters.upcoming !== undefined)  params.set('upcoming', filters.upcoming ? '1' : '0')
  if (filters.past)                   params.set('past', '1')
  if (filters.page)                   params.set('page', String(filters.page))
  if (filters.per_page)               params.set('per_page', String(filters.per_page))

  const qs = params.toString()
  return api.get<PaginatedEvents>(`/events${qs ? `?${qs}` : ''}`)
}

export async function getEvent(id: number): Promise<Event> {
  return api.get<Event>(`/events/${id}`)
}

export async function createEvent(payload: EventPayload): Promise<Event> {
  return api.post<Event>('/events', payload)
}

export async function updateEvent(id: number, payload: Partial<EventPayload>): Promise<Event> {
  return api.patch<Event>(`/events/${id}`, payload)
}

export async function deleteEvent(id: number): Promise<void> {
  await api.delete(`/events/${id}`)
}

export async function registerToEvent(id: number): Promise<{ message: string; registrations_count: number }> {
  return api.post(`/events/${id}/register`, {})
}

export async function unregisterFromEvent(id: number): Promise<{ message: string; registrations_count: number }> {
  return api.delete(`/events/${id}/register`)
}

// ---- Photos ----

export async function getEventPhotos(eventId: number): Promise<EventPhoto[]> {
  return api.get<EventPhoto[]>(`/events/${eventId}/photos`)
}

export async function uploadEventPhoto(eventId: number, file: File): Promise<EventPhoto> {
  const formData = new FormData()
  formData.append('photo', file)

  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
  const res = await fetch(`${API_BASE}/events/${eventId}/photos`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.message ?? 'Erreur lors de l\'upload')
  }

  return res.json()
}

export async function deleteEventPhoto(photoId: number): Promise<void> {
  await api.delete(`/event-photos/${photoId}`)
}
