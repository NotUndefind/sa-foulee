import { api } from '@/lib/api'
import type { Role, User, UserDocument } from '@/types'

export interface PaginatedUsers {
  data: User[]
  meta: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}

export interface UserFilters {
  search?: string
  role?: Role | ''
  page?: number
  per_page?: number
}

export async function getUsers(filters: UserFilters = {}): Promise<PaginatedUsers> {
  const params = new URLSearchParams()
  if (filters.search)   params.set('search', filters.search)
  if (filters.role)     params.set('role', filters.role)
  if (filters.page)     params.set('page', String(filters.page))
  if (filters.per_page) params.set('per_page', String(filters.per_page))

  const qs = params.toString()
  return api.get<PaginatedUsers>(`/users${qs ? `?${qs}` : ''}`)
}

export async function updateUserRole(userId: number, role: Role): Promise<User> {
  return api.patch<User>(`/users/${userId}/role`, { role })
}

export async function deleteUser(userId: number): Promise<void> {
  await api.delete(`/users/${userId}`)
}

export interface PendingDocument extends UserDocument {
  user: { id: number; first_name: string; last_name: string; email: string }
}

export async function getPendingDocuments(): Promise<PendingDocument[]> {
  return api.get<PendingDocument[]>('/documents/pending')
}

export async function getUserDocuments(userId: number): Promise<UserDocument[]> {
  return api.get<UserDocument[]>(`/users/${userId}/documents`)
}

export async function getDocumentDownloadUrl(documentId: number): Promise<{ url: string }> {
  return api.get<{ url: string }>(`/documents/${documentId}/download`)
}

export async function deleteDocument(documentId: number): Promise<void> {
  await api.delete(`/documents/${documentId}`)
}

export async function updateDocumentStatus(
  documentId: number,
  status: 'valid' | 'pending'
): Promise<UserDocument> {
  return api.patch<UserDocument>(`/documents/${documentId}/status`, { status })
}
