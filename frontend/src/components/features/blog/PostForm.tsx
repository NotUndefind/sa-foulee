'use client'

import { useToast } from '@/components/ui/Toast'
import { createPost, updatePost, type PostPayload } from '@/lib/posts'
import type { Post } from '@/types'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useEffect, useState } from 'react'

// ---- Templates prédéfinis ----
const TEMPLATES: { label: string; title: string; content: string }[] = [
  {
    label: '🏁 Compte-rendu de course',
    title: 'Compte-rendu — [Nom de la course]',
    content: `<h2>Compte-rendu de course</h2>
<p><strong>Date :</strong> </p>
<p><strong>Lieu :</strong> </p>
<p><strong>Participants :</strong> </p>
<h3>Résultats</h3>
<ul><li></li></ul>
<h3>Récit de course</h3>
<p></p>
<h3>Prochaine étape</h3>
<p></p>`,
  },
  {
    label: "📢 Annonce d'événement",
    title: "Annonce — [Nom de l'événement]",
    content: `<h2>Annonce</h2>
<p>Nous avons le plaisir de vous annoncer :</p>
<ul>
  <li><strong>Date :</strong> </li>
  <li><strong>Lieu :</strong> </li>
  <li><strong>Programme :</strong> </li>
</ul>
<p>Inscrivez-vous dès maintenant !</p>`,
  },
  {
    label: '🏆 Résultats',
    title: 'Résultats — [Compétition]',
    content: `<h2>Résultats</h2>
<p><strong>Compétition :</strong> </p>
<p><strong>Date :</strong> </p>
<h3>Podium</h3>
<ol><li></li><li></li><li></li></ol>
<h3>Classement complet</h3>
<p></p>`,
  },
]

interface Props {
  post?: Post
  onSuccess: (post: Post) => void
  onCancel: () => void
}

export default function PostForm({ post, onSuccess, onCancel }: Props) {
  const { toast } = useToast()
  const [title, setTitle] = useState(post?.title ?? '')
  const [image, setImage] = useState(post?.image ?? '')
  const [publishedAt, setPublishedAt] = useState(
    post?.published_at ? post.published_at.slice(0, 16) : ''
  )
  const [loading, setLoading] = useState(false)

  const editor = useEditor({
    extensions: [StarterKit],
    content: post?.content ?? '',
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none min-h-[200px] focus:outline-none px-4 py-3',
      },
    },
  })

  // Nettoyage éditeur au démontage
  useEffect(
    () => () => {
      editor?.destroy()
    },
    [editor]
  )

  const applyTemplate = (tpl: (typeof TEMPLATES)[0]) => {
    setTitle(tpl.title)
    editor?.commands.setContent(tpl.content)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const content = editor?.getHTML() ?? ''
    if (!title.trim() || content === '<p></p>' || !content.trim()) {
      toast('Titre et contenu requis.', 'error')
      return
    }

    setLoading(true)
    try {
      const payload: PostPayload = {
        title: title.trim(),
        content,
        image: image.trim() || null,
        published_at: publishedAt || null,
      }

      const saved = post ? await updatePost(post.id, payload) : await createPost(payload)

      toast(post ? 'Post modifié.' : 'Post créé !', 'success')
      onSuccess(saved)
    } catch {
      toast('Erreur lors de la sauvegarde.', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Templates (nouveau post uniquement) */}
      {!post && (
        <div>
          <p className="mb-2 text-xs font-medium text-zinc-500">Partir d&apos;un template</p>
          <div className="flex flex-wrap gap-2">
            {TEMPLATES.map((tpl) => (
              <button
                key={tpl.label}
                type="button"
                onClick={() => applyTemplate(tpl)}
                className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs text-zinc-600 transition hover:bg-zinc-50"
              >
                {tpl.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Titre */}
      <div>
        <label className="mb-1 block text-xs font-medium text-zinc-700">Titre</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          placeholder="Titre de l'article"
          className="focus:border-brand focus:ring-brand/20 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:ring-2 focus:outline-none"
        />
      </div>

      {/* Éditeur riche */}
      <div>
        <label className="mb-1 block text-xs font-medium text-zinc-700">Contenu</label>

        {/* Toolbar */}
        <div className="flex flex-wrap gap-1 rounded-t-lg border border-b-0 border-zinc-300 bg-zinc-50 px-2 py-1.5">
          {[
            {
              label: 'G',
              title: 'Gras',
              action: () => editor?.chain().focus().toggleBold().run(),
              active: () => editor?.isActive('bold'),
            },
            {
              label: 'I',
              title: 'Italique',
              action: () => editor?.chain().focus().toggleItalic().run(),
              active: () => editor?.isActive('italic'),
            },
            {
              label: 'S',
              title: 'Barré',
              action: () => editor?.chain().focus().toggleStrike().run(),
              active: () => editor?.isActive('strike'),
            },
          ].map((btn) => (
            <button
              key={btn.label}
              type="button"
              title={btn.title}
              onClick={btn.action}
              className={`rounded px-2 py-0.5 text-sm font-medium transition ${btn.active?.() ? 'bg-zinc-200 text-zinc-900' : 'text-zinc-500 hover:bg-zinc-100'}`}
            >
              {btn.label}
            </button>
          ))}
          <div className="mx-1 h-5 w-px self-center bg-zinc-200" />
          {[
            {
              label: 'H2',
              title: 'Titre 2',
              action: () => editor?.chain().focus().toggleHeading({ level: 2 }).run(),
              active: () => editor?.isActive('heading', { level: 2 }),
            },
            {
              label: 'H3',
              title: 'Titre 3',
              action: () => editor?.chain().focus().toggleHeading({ level: 3 }).run(),
              active: () => editor?.isActive('heading', { level: 3 }),
            },
          ].map((btn) => (
            <button
              key={btn.label}
              type="button"
              title={btn.title}
              onClick={btn.action}
              className={`rounded px-2 py-0.5 text-xs font-medium transition ${btn.active?.() ? 'bg-zinc-200 text-zinc-900' : 'text-zinc-500 hover:bg-zinc-100'}`}
            >
              {btn.label}
            </button>
          ))}
          <div className="mx-1 h-5 w-px self-center bg-zinc-200" />
          <button
            type="button"
            title="Liste à puces"
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
            className={`rounded px-2 py-0.5 text-xs font-medium transition ${editor?.isActive('bulletList') ? 'bg-zinc-200 text-zinc-900' : 'text-zinc-500 hover:bg-zinc-100'}`}
          >
            • Liste
          </button>
          <button
            type="button"
            title="Liste numérotée"
            onClick={() => editor?.chain().focus().toggleOrderedList().run()}
            className={`rounded px-2 py-0.5 text-xs font-medium transition ${editor?.isActive('orderedList') ? 'bg-zinc-200 text-zinc-900' : 'text-zinc-500 hover:bg-zinc-100'}`}
          >
            1. Liste
          </button>
          <button
            type="button"
            title="Citation"
            onClick={() => editor?.chain().focus().toggleBlockquote().run()}
            className={`rounded px-2 py-0.5 text-xs font-medium transition ${editor?.isActive('blockquote') ? 'bg-zinc-200 text-zinc-900' : 'text-zinc-500 hover:bg-zinc-100'}`}
          >
            &quot; Citation
          </button>
        </div>

        {/* Zone de contenu */}
        <div className="focus-within:border-brand focus-within:ring-brand/20 rounded-b-lg border border-zinc-300 bg-white focus-within:ring-2">
          <EditorContent editor={editor} />
        </div>
      </div>

      {/* Image URL (optionnelle) */}
      <div>
        <label className="mb-1 block text-xs font-medium text-zinc-700">
          Image (URL optionnelle)
        </label>
        <input
          type="url"
          value={image}
          onChange={(e) => setImage(e.target.value)}
          placeholder="https://..."
          className="focus:border-brand focus:ring-brand/20 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:ring-2 focus:outline-none"
        />
      </div>

      {/* Publication planifiée */}
      <div>
        <label className="mb-1 block text-xs font-medium text-zinc-700">
          Date de publication <span className="text-zinc-400">(laisser vide pour brouillon)</span>
        </label>
        <input
          type="datetime-local"
          value={publishedAt}
          onChange={(e) => setPublishedAt(e.target.value)}
          className="focus:border-brand focus:ring-brand/20 rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:ring-2 focus:outline-none"
        />
        {publishedAt && (
          <button
            type="button"
            onClick={() => setPublishedAt('')}
            className="ml-2 text-xs text-zinc-400 hover:text-zinc-600"
          >
            Effacer
          </button>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg px-4 py-2 text-sm text-zinc-600 transition hover:bg-zinc-100"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={loading}
          className="bg-brand hover:bg-brand-dark rounded-xl px-5 py-2 text-sm font-medium text-white transition disabled:opacity-50"
        >
          {loading ? 'Enregistrement…' : post ? 'Enregistrer' : 'Publier'}
        </button>
      </div>
    </form>
  )
}
