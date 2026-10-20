// Fetch côté serveur (Server Components) avec ISR — même pattern que la home :
// revalidate 5 min, timeout court et échec silencieux (le client prend le relais).

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1'

export async function serverFetch<T>(path: string, revalidate = 300): Promise<T | null> {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      next: { revalidate },
      signal: AbortSignal.timeout(5000),
      headers: { Accept: 'application/json' },
    })
    if (!res.ok) return null
    return (await res.json()) as T
  } catch {
    return null
  }
}

/**
 * Variante stricte : null uniquement si la ressource n'existe pas (404).
 * Toute autre erreur (5xx, 503 maintenance, timeout, réseau) est levée, ce qui
 * fait échouer la régénération ISR : Next.js continue alors de servir la
 * dernière version en cache au lieu de mettre en cache un faux 404.
 */
export async function serverFetchOrThrow<T>(path: string, revalidate = 300): Promise<T | null> {
  const res = await fetch(`${API_BASE}${path}`, {
    next: { revalidate },
    signal: AbortSignal.timeout(5000),
    headers: { Accept: 'application/json' },
  })
  if (res.status === 404) return null
  if (!res.ok) throw new Error(`API ${path} a répondu ${res.status}`)
  return (await res.json()) as T
}
