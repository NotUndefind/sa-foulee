import type { Metadata } from 'next'
import PostsPage from '@/components/features/blog/PostsPage'

export const metadata: Metadata = { title: 'Blog' }

export default function BlogRoute() {
  return <PostsPage />
}
