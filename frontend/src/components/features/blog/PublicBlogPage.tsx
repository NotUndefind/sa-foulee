'use client'

import { useEffect, useState, useCallback } from 'react'
import type { Post } from '@/types'
import { getPosts } from '@/lib/posts'
import Link from 'next/link'

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export default function PublicBlogPage() {
  const [posts,   setPosts]   = useState<Post[]>([])
  const [meta,    setMeta]    = useState({ current_page: 1, last_page: 1, total: 0, per_page: 10 })
  const [page,    setPage]    = useState(1)
  const [loading, setLoading] = useState(true)

  const fetchPosts = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getPosts({ page })
      setPosts(res.data)
      setMeta(res.meta)
    } catch {
      // silencieux
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => { fetchPosts() }, [fetchPosts])

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-10">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Actualités</h1>
        <p className="mt-1 text-sm text-zinc-500">Les dernières nouvelles de sa Foulée</p>
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center text-sm text-zinc-400">Chargement…</div>
      ) : posts.length === 0 ? (
        <div className="flex h-40 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-zinc-200 text-sm text-zinc-400">
          Aucun article publié pour l'instant.
        </div>
      ) : (
        <div className="space-y-8">
          {posts.map((post) => (
            <article key={post.id} className="rounded-2xl bg-white shadow-sm ring-1 ring-zinc-200 overflow-hidden">
              {post.image && (
                <div className="h-48 w-full overflow-hidden bg-zinc-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={post.image} alt="" className="h-full w-full object-cover" />
                </div>
              )}
              <div className="p-6">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  {post.is_pinned && (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">📌 Épinglé</span>
                  )}
                  {post.published_at && (
                    <span className="text-xs text-zinc-400">{formatDate(post.published_at)}</span>
                  )}
                  {post.author && (
                    <span className="text-xs text-zinc-400">par {post.author.name}</span>
                  )}
                </div>
                <h2 className="text-lg font-bold text-zinc-900">{post.title}</h2>
                <div
                  className="prose prose-sm mt-3 max-w-none text-zinc-700 line-clamp-4"
                  dangerouslySetInnerHTML={{ __html: post.content }}
                />
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs text-zinc-400">
                    💬 {post.comments_count} commentaire{post.comments_count !== 1 ? 's' : ''}
                  </span>
                  <Link
                    href="/connexion"
                    className="text-xs font-medium text-brand hover:underline"
                  >
                    Connectez-vous pour commenter →
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Pagination */}
      {meta.last_page > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-zinc-500">Page {meta.current_page} sur {meta.last_page}</p>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="rounded-lg border border-zinc-200 px-3 py-1 text-xs disabled:opacity-40 hover:bg-zinc-50"
            >
              ← Précédent
            </button>
            <button
              disabled={page >= meta.last_page}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-lg border border-zinc-200 px-3 py-1 text-xs disabled:opacity-40 hover:bg-zinc-50"
            >
              Suivant →
            </button>
          </div>
        </div>
      )}

      <div className="text-center pt-4">
        <Link
          href="/inscription"
          className="inline-block rounded-xl bg-brand px-6 py-2.5 text-sm font-medium text-white hover:bg-brand-dark transition"
        >
          Rejoindre l'association pour commenter
        </Link>
      </div>
    </div>
  )
}
