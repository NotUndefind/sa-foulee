'use client'

import { useToast } from '@/components/ui/Toast'
import { createPost, updatePost, type PostPayload } from '@/lib/posts'
import { uploadMedia } from '@/lib/upload'
import type { Post } from '@/types'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useEffect, useRef, useState } from 'react'

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

const MAX_IMAGE_SIZE = 5 * 1024 * 1024 // 5 Mo
const MAX_VIDEO_SIZE = 50 * 1024 * 1024 // 50 Mo

interface Props {
  post?: Post
  onSuccess: (post: Post) => void
  onCancel: () => void
}

export default function PostForm({ post, onSuccess, onCancel }: Props) {
  const { toast } = useToast()

  const [title, setTitle] = useState(post?.title ?? '')
  const [imageUrl, setImageUrl] = useState(post?.image ?? '')
  const [showUrlField, setShowUrlField] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)

  const imageInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)

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

  useEffect(
    () => () => {
      editor?.destroy()
      if (imagePreview) URL.revokeObjectURL(imagePreview)
    },
    [editor] // eslint-disable-line react-hooks/exhaustive-deps
  )

  const applyTemplate = (tpl: (typeof TEMPLATES)[0]) => {
    setTitle(tpl.title)
    editor?.commands.setContent(tpl.content)
  }

  const handleImagePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > MAX_IMAGE_SIZE) {
      toast("L'image ne peut pas dépasser 5 Mo.", 'error')
      e.target.value = ''
      return
    }
    setImageFile(file)
    setVideoFile(null)
    if (imagePreview) URL.revokeObjectURL(imagePreview)
    setImagePreview(URL.createObjectURL(file))
    setImageUrl('')
  }

  const handleVideoPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > MAX_VIDEO_SIZE) {
      toast('La vidéo ne peut pas dépasser 50 Mo.', 'error')
      e.target.value = ''
      return
    }
    setVideoFile(file)
    setImageFile(null)
    setImagePreview(null)
    setImageUrl('')
  }

  const clearMedia = () => {
    setImageFile(null)
    setVideoFile(null)
    if (imagePreview) URL.revokeObjectURL(imagePreview)
    setImagePreview(null)
    if (imageInputRef.current) imageInputRef.current.value = ''
    if (videoInputRef.current) videoInputRef.current.value = ''
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
      let finalImageUrl = imageUrl.trim() || null

      // Upload du fichier sélectionné avant la soumission principale
      if (imageFile) {
        try {
          finalImageUrl = await uploadMedia(imageFile)
        } catch (err) {
          toast(err instanceof Error ? err.message : "Erreur lors de l'upload de l'image.", 'error')
          setLoading(false)
          return
        }
      } else if (videoFile) {
        try {
          finalImageUrl = await uploadMedia(videoFile)
        } catch (err) {
          toast(
            err instanceof Error ? err.message : "Erreur lors de l'upload de la vidéo.",
            'error'
          )
          setLoading(false)
          return
        }
      }

      const payload: PostPayload = {
        title: title.trim(),
        content,
        image: finalImageUrl,
      }

      const saved = post ? await updatePost(post.id, payload) : await createPost(payload)

      toast(post ? 'Post modifié.' : 'Post publié !', 'success')
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
          className="focus:border-primary focus:ring-primary/20 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:ring-2 focus:outline-none"
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
        <div className="focus-within:border-primary focus-within:ring-primary/20 rounded-b-lg border border-zinc-300 bg-white focus-within:ring-2">
          <EditorContent editor={editor} />
        </div>
      </div>

      {/* Médias — upload ou URL */}
      <div>
        <label className="mb-2 block text-xs font-medium text-zinc-700">
          Image / Vidéo (optionnel)
        </label>

        <div className="flex flex-wrap gap-2">
          {/* Bouton image */}
          <button
            type="button"
            onClick={() => imageInputRef.current?.click()}
            className="flex items-center gap-1.5 rounded-lg border border-zinc-300 px-3 py-1.5 text-xs text-zinc-600 transition hover:bg-zinc-50"
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="m21 15-5-5L5 21" />
            </svg>
            Ajouter une image
          </button>

          {/* Bouton vidéo */}
          <button
            type="button"
            onClick={() => videoInputRef.current?.click()}
            className="flex items-center gap-1.5 rounded-lg border border-zinc-300 px-3 py-1.5 text-xs text-zinc-600 transition hover:bg-zinc-50"
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="2" y="6" width="20" height="12" rx="2" />
              <path d="m22 8-6 4 6 4V8z" fill="currentColor" stroke="none" />
            </svg>
            Ajouter une vidéo
          </button>

          {/* Basculer URL */}
          <button
            type="button"
            onClick={() => setShowUrlField((v) => !v)}
            className="text-xs text-zinc-400 transition hover:text-zinc-600"
          >
            {showUrlField ? 'Masquer URL' : 'ou entrer une URL'}
          </button>
        </div>

        {/* Inputs cachés */}
        <input
          ref={imageInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleImagePick}
        />
        <input
          ref={videoInputRef}
          type="file"
          accept="video/mp4"
          className="hidden"
          onChange={handleVideoPick}
        />

        {/* Preview image */}
        {imagePreview && (
          <div className="mt-3 flex items-start gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imagePreview}
              alt="Preview"
              className="h-20 w-20 rounded-lg border border-zinc-200 object-cover"
            />
            <button
              type="button"
              onClick={clearMedia}
              className="text-xs text-zinc-400 transition hover:text-red-500"
            >
              Supprimer
            </button>
          </div>
        )}

        {/* Nom de la vidéo sélectionnée */}
        {videoFile && (
          <div className="mt-2 flex items-center gap-2 text-xs text-zinc-600">
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="2" y="6" width="20" height="12" rx="2" />
            </svg>
            <span>{videoFile.name}</span>
            <button
              type="button"
              onClick={clearMedia}
              className="text-zinc-400 transition hover:text-red-500"
            >
              ✕
            </button>
          </div>
        )}

        {/* Champ URL (collapsible) */}
        {showUrlField && (
          <div className="mt-3">
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => {
                setImageUrl(e.target.value)
                clearMedia()
              }}
              placeholder="https://..."
              className="focus:border-primary focus:ring-primary/20 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:ring-2 focus:outline-none"
            />
          </div>
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
          className="flex items-center gap-2 rounded-xl px-5 py-2 text-sm font-semibold text-white transition disabled:opacity-50"
          style={{ background: loading ? '#D42F2D' : '#FB3936' }}
        >
          {loading && (
            <svg
              className="animate-spin"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <circle cx="12" cy="12" r="10" strokeOpacity=".25" />
              <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
            </svg>
          )}
          {loading ? 'Enregistrement…' : post ? 'Enregistrer' : 'Publier'}
        </button>
      </div>
    </form>
  )
}
