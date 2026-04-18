const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1'

export async function uploadMedia(file: File): Promise {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null

  const formData = new FormData()
  formData.append('file', file)

  const res = await fetch(`${API_BASE_URL}/uploads/media`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.message ?? "Erreur lors de l'upload.")
  }

  const { url } = await res.json()
  return url as string
}
