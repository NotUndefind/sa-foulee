import type { Metadata } from 'next'
import PublicBlogPage from '@/components/features/blog/PublicBlogPage'

export const metadata: Metadata = {
  title: 'Actualités — sa Foulée',
  description: 'Suivez les actualités, comptes-rendus de courses et annonces de sa Foulée.',
}

export default function PublicBlogRoute() {
  return <PublicBlogPage />
}
