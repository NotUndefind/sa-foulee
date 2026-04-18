import { api } from '@/lib/api'
import type { User, UserDocument } from '@/types'

// ---- Profil ----

export async function getMe(): Promise {
  return api.get<User>('/me')
}

export async function updateProfile(data: {
  first_name?: string
  last_name?: string
  bio?: string
  email?: string
  avatar?: File
}): Promise {
  // Utiliser FormData pour l'upload d'avatar
  const formData = new FormData()
  // Laravel ne parse pas $_POST/$_FILES pour les requêtes PATCH multipart/form-data (limite PHP).
  // On utilise le method spoofing : POST + _method=PATCH.
  formData.append('_method', 'PATCH')
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, value as string | Blob)
    }
  })

  const apiBase = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1'
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null

  const res = await fetch(`${apiBase}/me`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    // Pour les erreurs 422, ne pas exposer le message backend (l'utilisateur
    // a peut-être contourné la validation front via les devtools).
    const message =
      res.status === 422
        ? 'Une erreur est survenue. Veuillez réessayer.'
        : err.message ?? 'Erreur lors de la sauvegarde.'
    throw Object.assign(new Error(message), {
      status: res.status,
      errors: err.errors,
    })
  }

  return res.json()
}

export async function deleteAccount(): Promise {
  await api.delete('/me')
  localStorage.removeItem('auth_token')
}

// ---- Documents ----

export async function getDocuments(userId: number): Promise {
  return api.get<UserDocument[]>(`/users/${userId}/documents`)
}

export async function uploadDocument(
  userId: number,
  type: string,
  file: File,
  expiresAt?: string
): Promise {
  const formData = new FormData()
  formData.append('type', type)
  formData.append('file', file)
  if (expiresAt) formData.append('expires_at', expiresAt)

  const apiBase = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1'
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null

  const res = await fetch(`${apiBase}/users/${userId}/documents`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw Object.assign(new Error(err.message ?? 'Erreur upload'), {
      status: res.status,
      errors: err.errors,
    })
  }

  return res.json()
}

export async function getDocumentDownloadUrl(documentId: number): Promise {
  return api.get(`/documents/${documentId}/download`)
}

export async function deleteDocument(documentId: number): Promise {
  await api.delete(`/documents/${documentId}`)
}
