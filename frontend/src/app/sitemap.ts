import type { PaginatedPosts } from '@/lib/posts'
import { serverFetch } from '@/lib/server-api'
import type { Post } from '@/types'
import type { MetadataRoute } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://www.laneuvilletafsafoulee.fr'

// Garde-fou : l'API pagine par 10, 50 pages couvrent 500 articles.
const MAX_POST_PAGES = 50

/**
 * Tous les articles publiés, toutes pages confondues (les slugs viennent de
 * l'API ; échec silencieux toléré, une page en erreur est simplement ignorée).
 */
async function fetchAllPosts(): Promise<Post[]> {
  const first = await serverFetch<PaginatedPosts>('/posts?page=1', 3600)
  if (!first) return []

  const lastPage = Math.min(first.meta.last_page, MAX_POST_PAGES)
  const rest = await Promise.all(
    Array.from({ length: Math.max(0, lastPage - 1) }, (_, i) =>
      serverFetch<PaginatedPosts>(`/posts?page=${i + 2}`, 3600)
    )
  )

  return [first, ...rest].flatMap((page) => page?.data ?? [])
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE_URL}/blog`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/evenements`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/activites`, changeFrequency: 'daily', priority: 0.8 },
  ]

  const postPages: MetadataRoute.Sitemap = (await fetchAllPosts())
    .filter((p) => p.slug)
    .map((p) => ({
      url: `${BASE_URL}/blog/${p.slug}`,
      lastModified: p.published_at ?? undefined,
      changeFrequency: 'monthly',
      priority: 0.7,
    }))

  return [...staticPages, ...postPages]
}
