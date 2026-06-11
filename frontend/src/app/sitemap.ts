import type { PaginatedPosts } from '@/lib/posts'
import { serverFetch } from '@/lib/server-api'
import type { MetadataRoute } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://www.laneuvilletafsafoulee.fr'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE_URL}/blog`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/evenements`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/activites`, changeFrequency: 'daily', priority: 0.8 },
  ]

  // Articles publiés (les slugs viennent de l'API ; échec silencieux toléré).
  const posts = await serverFetch<PaginatedPosts>('/posts?page=1', 3600)
  const postPages: MetadataRoute.Sitemap = (posts?.data ?? [])
    .filter((p) => p.slug)
    .map((p) => ({
      url: `${BASE_URL}/blog/${p.slug}`,
      lastModified: p.published_at ?? undefined,
      changeFrequency: 'monthly',
      priority: 0.7,
    }))

  return [...staticPages, ...postPages]
}
