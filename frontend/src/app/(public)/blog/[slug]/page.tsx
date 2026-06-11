import { serverFetch } from '@/lib/server-api'
import type { Post } from '@/types'
import DOMPurify from 'isomorphic-dompurify'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export const revalidate = 300

interface Props {
  params: Promise<{ slug: string }>
}

function getPost(slug: string): Promise<Post | null> {
  return serverFetch<Post>(`/posts/slug/${encodeURIComponent(slug)}`)
}

/** Extrait ~160 caractères de texte brut du HTML pour la meta description. */
function excerpt(html: string): string {
  const text = html
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  return text.length > 160 ? `${text.slice(0, 157)}…` : text
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) return { title: 'Article introuvable' }

  return {
    title: post.title,
    description: excerpt(post.content),
    openGraph: {
      title: post.title,
      description: excerpt(post.content),
      type: 'article',
      ...(post.image ? { images: [post.image] } : {}),
      ...(post.published_at ? { publishedTime: post.published_at } : {}),
    },
  }
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) notFound()

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link href="/blog" className="text-primary text-sm font-medium hover:underline">
        ← Toutes les actualités
      </Link>

      <article className="mt-6 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-zinc-200">
        {post.image && (
          <div className="h-64 w-full overflow-hidden bg-zinc-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={post.image} alt="" className="h-full w-full object-cover" />
          </div>
        )}
        <div className="p-6 sm:p-8">
          <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-zinc-400">
            {post.published_at && <span>{formatDate(post.published_at)}</span>}
            {post.author && <span>par {post.author.name}</span>}
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 sm:text-3xl">{post.title}</h1>
          <div
            className="prose prose-zinc mt-6 max-w-none"
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content) }}
          />
        </div>
      </article>

      <div className="mt-8 text-center">
        <Link
          href="/inscription"
          className="bg-primary hover:bg-primary-dark inline-block rounded-xl px-6 py-2.5 text-sm font-medium text-white transition"
        >
          Rejoindre l&apos;association pour commenter
        </Link>
      </div>
    </div>
  )
}
