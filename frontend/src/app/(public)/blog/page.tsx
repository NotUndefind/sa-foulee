import PublicBlogPage from '@/components/features/blog/PublicBlogPage'
import type { PaginatedPosts } from '@/lib/posts'
import { serverFetch } from '@/lib/server-api'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Actualités',
  description:
    'Suivez les actualités, comptes-rendus de courses et annonces de La Neuville TAF sa Foulée.',
}

// ISR : le contenu des articles est présent dans le HTML initial (SEO),
// rafraîchi toutes les 5 minutes.
export const revalidate = 300

export default async function PublicBlogRoute() {
  const initialData = await serverFetch<PaginatedPosts>('/posts?page=1')

  return <PublicBlogPage initialData={initialData} />
}
