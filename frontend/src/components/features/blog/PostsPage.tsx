'use client'

import { useRole } from '@/hooks/useRole'
import { getPosts, type PostFilters } from '@/lib/posts'
import type { Post } from '@/types'
import { useCallback, useEffect, useState } from 'react'
import PostCard from './PostCard'
import PostForm from './PostForm'

function IconNewspaper() {
  return (
    <svg
      width={26}
      height={26}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
      <path d="M18 14h-8M15 18h-5M10 6h8v4h-8z" />
    </svg>
  )
}

function IconEmptyNewspaper() {
  return (
    <svg
      width={48}
      height={48}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
      <path d="M18 14h-8M15 18h-5M10 6h8v4h-8z" />
    </svg>
  )
}

export default function PostsPage() {
  const { canPublish, hasAnyRole } = useRole()
  const canPin = hasAnyRole('admin', 'founder')

  const [posts, setPosts] = useState<Post[]>([])
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0, per_page: 10 })
  const [filters, setFilters] = useState<PostFilters>({ page: 1 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editPost, setEditPost] = useState<Post | undefined>()

  const fetchPosts = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await getPosts(filters)
      setPosts(res.data)
      setMeta(res.meta)
    } catch {
      setError('Impossible de charger les posts.')
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  const handleUpdate = (updated: Post) =>
    setPosts((p) => p.map((post) => (post.id === updated.id ? updated : post)))
  const handleDelete = (id: number) => {
    setPosts((p) => p.filter((post) => post.id !== id))
    setMeta((m) => ({ ...m, total: m.total - 1 }))
  }
  const handleEdit = (post: Post) => {
    setEditPost(post)
    setShowForm(true)
  }
  const handleFormSuccess = (saved: Post) => {
    if (editPost) {
      handleUpdate(saved)
    } else {
      setPosts((p) => [saved, ...p])
      setMeta((m) => ({ ...m, total: m.total + 1 }))
    }
    setShowForm(false)
    setEditPost(undefined)
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@400;500;600;700;800&display=swap');
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .blog-page { font-family: 'Baloo 2', sans-serif; }
        .blog-fade { animation: fadeUp 0.4s ease both; }
        .blog-divider {
          height: 3px; width: 40px; border-radius: 2px;
          background: linear-gradient(90deg, #FB3936, #7F7F7F);
          margin-top: 6px; margin-bottom: 24px;
        }
      `}</style>

      <div className="blog-page min-h-screen pb-24 lg:pb-8" style={{ background: '#F8F8F8' }}>
        <div className="mx-auto max-w-3xl px-5 py-8">
          {/* ── Header ─────────────────────────────────────────────────── */}
          <div
            className="blog-fade mb-2 flex items-start justify-between"
            style={{ animationDelay: '0ms' }}
          >
            <div>
              <div className="flex items-center gap-2" style={{ color: '#D42F2D' }}>
                <IconNewspaper />
                <h1
                  className="text-3xl font-extrabold"
                  style={{ letterSpacing: '-0.02em', color: '#C0302E' }}
                >
                  Blog de l&apos;association
                </h1>
              </div>
              <p className="mt-1 text-sm" style={{ color: '#7F7F7F' }}>
                {meta.total} article{meta.total > 1 ? 's' : ''} · Actualités de La Neuville TAF sa
                Foulée
              </p>
            </div>

            {canPublish && !showForm && (
              <button
                onClick={() => {
                  setEditPost(undefined)
                  setShowForm(true)
                }}
                className="shrink-0 rounded-xl px-4 py-2.5 text-sm font-bold text-white transition"
                style={{
                  background: 'linear-gradient(135deg, #FB3936 0%, #D42F2D 100%)',
                  boxShadow: '0 2px 8px rgba(251,57,54,0.3)',
                }}
              >
                + Rédiger
              </button>
            )}
          </div>
          <div className="blog-divider" />

          {/* ── Form ───────────────────────────────────────────────────── */}
          {showForm && (
            <div
              className="blog-fade mb-6 overflow-hidden rounded-2xl bg-white"
              style={{
                animationDelay: '40ms',
                boxShadow: '0 4px 20px rgba(192,48,46,0.08)',
                border: '1px solid rgba(192,48,46,0.08)',
              }}
            >
              <div
                className="px-6 py-4"
                style={{
                  background:
                    'linear-gradient(135deg, rgba(176,137,138,0.08) 0%, rgba(251,57,54,0.04) 100%)',
                  borderBottom: '1px solid rgba(192,48,46,0.06)',
                }}
              >
                <h2 className="font-bold" style={{ color: '#C0302E' }}>
                  {editPost ? "Modifier l'article" : 'Nouvel article'}
                </h2>
                <p className="mt-0.5 text-xs" style={{ color: '#7F7F7F' }}>
                  Partagez une actualité avec les membres de l&apos;association
                </p>
              </div>
              <div className="p-6">
                <PostForm
                  post={editPost}
                  onSuccess={handleFormSuccess}
                  onCancel={() => {
                    setShowForm(false)
                    setEditPost(undefined)
                  }}
                />
              </div>
            </div>
          )}

          {/* ── Error ──────────────────────────────────────────────────── */}
          {error && (
            <div
              className="mb-4 rounded-xl px-4 py-3 text-sm"
              style={{
                background: 'rgba(251,57,54,0.06)',
                border: '1px solid rgba(251,57,54,0.2)',
                color: '#D42F2D',
              }}
            >
              {error}
            </div>
          )}

          {/* ── Content ────────────────────────────────────────────────── */}
          {loading ? (
            <div className="flex h-48 items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <div
                  className="h-8 w-8 animate-spin rounded-full border-2"
                  style={{ borderColor: 'rgba(192,48,46,0.1)', borderTopColor: '#FB3936' }}
                />
                <p className="text-sm" style={{ color: '#7F7F7F' }}>
                  Chargement des articles…
                </p>
              </div>
            </div>
          ) : posts.length === 0 ? (
            <div
              className="flex h-48 flex-col items-center justify-center gap-3 rounded-2xl bg-white"
              style={{ border: '1px solid rgba(192,48,46,0.07)' }}
            >
              <div style={{ opacity: 0.3, color: '#D42F2D' }}>
                <IconEmptyNewspaper />
              </div>
              <p className="text-sm" style={{ color: '#7F7F7F' }}>
                Aucun article publié pour l&apos;instant.
              </p>
              {canPublish && (
                <button
                  onClick={() => setShowForm(true)}
                  className="text-xs font-semibold hover:underline"
                  style={{ color: '#FB3936' }}
                >
                  Rédiger le premier article →
                </button>
              )}
            </div>
          ) : (
            <div className="blog-fade space-y-5" style={{ animationDelay: '80ms' }}>
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onUpdate={handleUpdate}
                  onDelete={handleDelete}
                  onEdit={canPublish ? handleEdit : undefined}
                  canPin={canPin}
                />
              ))}
            </div>
          )}

          {/* ── Pagination ─────────────────────────────────────────────── */}
          {meta.last_page > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <p className="text-xs" style={{ color: '#7F7F7F' }}>
                Page {meta.current_page} sur {meta.last_page}
              </p>
              <div className="flex gap-2">
                <button
                  disabled={meta.current_page <= 1}
                  onClick={() => setFilters((f) => ({ ...f, page: (f.page ?? 1) - 1 }))}
                  className="rounded-xl px-4 py-2 text-xs font-medium transition disabled:opacity-30"
                  style={{
                    border: '1px solid rgba(192,48,46,0.12)',
                    color: '#D42F2D',
                    background: 'white',
                  }}
                >
                  ← Précédent
                </button>
                <button
                  disabled={meta.current_page >= meta.last_page}
                  onClick={() => setFilters((f) => ({ ...f, page: (f.page ?? 1) + 1 }))}
                  className="rounded-xl px-4 py-2 text-xs font-medium transition disabled:opacity-30"
                  style={{
                    border: '1px solid rgba(192,48,46,0.12)',
                    color: '#D42F2D',
                    background: 'white',
                  }}
                >
                  Suivant →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
