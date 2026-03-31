'use client'

import { useToast } from '@/components/ui/Toast'
import { useRole } from '@/hooks/useRole'
import { addComment, deleteComment, deletePost, getComments, togglePinPost } from '@/lib/posts'
import type { Comment, Post } from '@/types'
import { useState } from 'react'

interface Props {
  post: Post
  onUpdate: (post: Post) => void
  onDelete: (id: number) => void
  onEdit?: (post: Post) => void
  /** Afficher le bouton épingler (admin/founder uniquement) */
  canPin?: boolean
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function IconPin({ size = 12 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="12" y1="17" x2="12" y2="22" />
      <path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z" />
    </svg>
  )
}

function IconComment() {
  return (
    <svg
      width={14}
      height={14}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  )
}

export default function PostCard({ post, onUpdate, onDelete, onEdit, canPin }: Props) {
  const { isAdmin, canPublish } = useRole()
  const { toast } = useToast()

  const [showComments, setShowComments] = useState(false)
  const [comments, setComments] = useState<Comment[]>([])
  const [commentsMeta, setCommentsMeta] = useState({ current_page: 1, last_page: 1, total: 0 })
  const [commentsLoading, setCommentsLoading] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const loadComments = async (page = 1) => {
    setCommentsLoading(true)
    try {
      const res = await getComments(post.id, page)
      setComments(page === 1 ? res.data : [...comments, ...res.data])
      setCommentsMeta(res.meta)
    } catch {
      toast('Erreur lors du chargement des commentaires.', 'error')
    } finally {
      setCommentsLoading(false)
    }
  }

  const handleToggleComments = () => {
    if (!showComments && comments.length === 0) {
      loadComments()
    }
    setShowComments((v) => !v)
  }

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return
    setSubmitting(true)
    try {
      const c = await addComment(post.id, newComment.trim())
      setComments((prev) => [...prev, c])
      setCommentsMeta((m) => ({ ...m, total: m.total + 1 }))
      onUpdate({ ...post, comments_count: post.comments_count + 1 })
      setNewComment('')
    } catch {
      toast("Erreur lors de l'ajout du commentaire.", 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteComment = async (commentId: number) => {
    if (!confirm('Supprimer ce commentaire ?')) return
    try {
      await deleteComment(commentId)
      setComments((prev) => prev.filter((c) => c.id !== commentId))
      setCommentsMeta((m) => ({ ...m, total: m.total - 1 }))
      onUpdate({ ...post, comments_count: Math.max(0, post.comments_count - 1) })
    } catch {
      toast('Erreur lors de la suppression.', 'error')
    }
  }

  const handleDelete = async () => {
    if (!confirm(`Supprimer "${post.title}" ?`)) return
    try {
      await deletePost(post.id)
      onDelete(post.id)
      toast('Post supprimé.', 'info')
    } catch {
      toast('Erreur lors de la suppression.', 'error')
    }
  }

  const handlePin = async () => {
    try {
      const res = await togglePinPost(post.id)
      onUpdate({ ...post, is_pinned: res.is_pinned })
      toast(res.is_pinned ? 'Post épinglé.' : 'Post désépinglé.', 'info')
    } catch {
      toast('Erreur.', 'error')
    }
  }

  return (
    <article
      className="overflow-hidden rounded-2xl bg-white"
      style={{
        boxShadow: '0 2px 10px rgba(192,48,46,0.07)',
        border: '1px solid rgba(192,48,46,0.08)',
      }}
    >
      {/* Image */}
      {post.image && (
        <div className="h-48 w-full overflow-hidden" style={{ background: '#FAFAFA' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={post.image} alt="" className="h-full w-full object-cover" />
        </div>
      )}

      <div className="p-6">
        {/* Badges */}
        <div className="mb-3 flex flex-wrap items-center gap-2">
          {post.is_pinned && (
            <span
              className="flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
              style={{
                background: 'rgba(251,57,54,0.1)',
                color: '#FB3936',
                border: '1px solid rgba(251,57,54,0.2)',
              }}
            >
              <IconPin /> Épinglé
            </span>
          )}
          {post.published_at && (
            <span className="text-xs" style={{ color: '#7F7F7F' }}>
              {formatDate(post.published_at)}
            </span>
          )}
          {post.author && (
            <span className="text-xs" style={{ color: '#7F7F7F' }}>
              par {post.author.name}
            </span>
          )}
        </div>

        {/* Titre */}
        <h2 className="text-lg font-bold" style={{ color: '#C0302E' }}>
          {post.title}
        </h2>

        {/* Contenu HTML (Tiptap output) */}
        <div
          className="prose prose-sm mt-3 max-w-none"
          style={{ color: '#D42F2D' }}
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Actions */}
        <div
          className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t pt-4"
          style={{ borderColor: 'rgba(192,48,46,0.06)' }}
        >
          <button
            onClick={handleToggleComments}
            className="flex items-center gap-1.5 text-sm transition"
            style={{ color: '#7F7F7F' }}
          >
            <IconComment />
            {post.comments_count} commentaire{post.comments_count !== 1 ? 's' : ''}
          </button>

          <div className="flex gap-1">
            {canPin && (
              <button
                onClick={handlePin}
                className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs transition"
                style={
                  post.is_pinned
                    ? { color: '#FB3936', background: 'rgba(251,57,54,0.06)' }
                    : { color: '#7F7F7F' }
                }
              >
                <IconPin /> {post.is_pinned ? 'Désépingler' : 'Épingler'}
              </button>
            )}
            {canPublish && onEdit && (
              <button
                onClick={() => onEdit(post)}
                className="rounded-lg px-2 py-1 text-xs transition"
                style={{ color: '#D42F2D' }}
              >
                Modifier
              </button>
            )}
            {canPublish && (
              <button
                onClick={handleDelete}
                className="rounded-lg px-2 py-1 text-xs transition"
                style={{ color: '#D42F2D' }}
              >
                Supprimer
              </button>
            )}
          </div>
        </div>

        {/* Section commentaires */}
        {showComments && (
          <div
            className="mt-4 space-y-3 border-t pt-4"
            style={{ borderColor: 'rgba(192,48,46,0.06)' }}
          >
            {commentsLoading ? (
              <p className="text-center text-xs" style={{ color: '#7F7F7F' }}>
                Chargement…
              </p>
            ) : comments.length === 0 ? (
              <p className="text-center text-xs" style={{ color: '#7F7F7F' }}>
                Aucun commentaire. Soyez le premier !
              </p>
            ) : (
              comments.map((c) => (
                <div key={c.id} className="flex items-start gap-3">
                  <div
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                    style={{ background: 'rgba(169,50,38,0.1)', color: '#D42F2D' }}
                  >
                    {c.user?.name?.charAt(0) ?? '?'}
                  </div>
                  <div className="flex-1 rounded-xl px-3 py-2" style={{ background: '#F8F8F8' }}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-medium" style={{ color: '#C0302E' }}>
                        {c.user?.name ?? 'Membre'}
                      </span>
                      <span className="text-xs" style={{ color: '#7F7F7F' }}>
                        {formatDate(c.created_at)}
                      </span>
                    </div>
                    <p className="mt-0.5 text-sm" style={{ color: '#D42F2D' }}>
                      {c.content}
                    </p>
                  </div>
                  {(isAdmin || true) && (
                    <button
                      onClick={() => handleDeleteComment(c.id)}
                      className="mt-1 text-xs transition"
                      style={{ color: 'rgba(192,48,46,0.2)' }}
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))
            )}

            {commentsMeta.current_page < commentsMeta.last_page && (
              <button
                onClick={() => loadComments(commentsMeta.current_page + 1)}
                className="w-full text-center text-xs transition hover:underline"
                style={{ color: '#7F7F7F' }}
              >
                Charger plus
              </button>
            )}

            {/* Formulaire commentaire */}
            <form onSubmit={handleSubmitComment} className="flex gap-2 pt-1">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Ajouter un commentaire…"
                className="flex-1 rounded-lg px-3 py-2 text-sm transition outline-none"
                style={{ border: '1px solid rgba(192,48,46,0.15)', color: '#C0302E' }}
              />
              <button
                type="submit"
                disabled={submitting || !newComment.trim()}
                className="rounded-lg px-4 py-2 text-sm font-medium text-white transition disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #FB3936 0%, #D42F2D 100%)' }}
              >
                {submitting ? '…' : 'Envoyer'}
              </button>
            </form>
          </div>
        )}
      </div>
    </article>
  )
}
