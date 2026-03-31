'use client'

import { useRef, useState } from 'react'
import { uploadDocument } from '@/lib/profile'
import type { UserDocument } from '@/types'

const DOCUMENT_TYPES = [
  { value: 'license', label: 'Licence FFA' },
  { value: 'registration', label: "Certificat d'inscription" },
  { value: 'medical_certificate', label: 'Certificat médical' },
  { value: 'other', label: 'Autre document' },
]

interface Props {
  userId: number
  onUploaded: (doc: UserDocument) => void
  onClose: () => void
}

export default function DocumentUploadModal({ userId, onUploaded, onClose }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [type, setType] = useState('license')
  const [expiresAt, setExpiry] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) {
      setError('Sélectionne un fichier.')
      return
    }
    setError(null)
    setLoading(true)

    try {
      const doc = await uploadDocument(userId, type, file, expiresAt || undefined)
      onUploaded(doc)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erreur lors de l'upload."
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    /* Overlay */
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-900">Ajouter un document</h2>
          <button onClick={onClose} className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-100">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">
              {error}
            </div>
          )}

          {/* Type */}
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">Type de document</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="focus:border-brand focus:ring-brand/20 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 focus:ring-2 focus:outline-none"
            >
              {DOCUMENT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {/* Fichier */}
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">Fichier</label>
            <div
              onClick={() => fileRef.current?.click()}
              className="hover:border-brand flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-zinc-300 px-4 py-6 transition hover:bg-zinc-50"
            >
              {file ? (
                <p className="text-sm font-medium text-zinc-800">{file.name}</p>
              ) : (
                <>
                  <span className="text-2xl">📎</span>
                  <p className="mt-2 text-sm text-zinc-500">Clique pour sélectionner</p>
                  <p className="text-xs text-zinc-400">PDF, JPG, PNG, WEBP · max 5 Mo</p>
                </>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.webp"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </div>

          {/* Date d'expiration (optionnelle) */}
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">
              Date d&apos;expiration <span className="text-zinc-400">(optionnel)</span>
            </label>
            <input
              type="date"
              value={expiresAt}
              onChange={(e) => setExpiry(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="focus:border-brand focus:ring-brand/20 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 focus:ring-2 focus:outline-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-brand hover:bg-brand-dark flex-1 rounded-lg px-4 py-2 text-sm font-semibold text-white transition disabled:opacity-60"
            >
              {loading ? 'Upload…' : 'Ajouter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
