'use client'

import { useState } from 'react'
import type { UserDocument } from '@/types'
import { getDocumentDownloadUrl, deleteDocument } from '@/lib/profile'

const TYPE_LABELS: Record = {
  license: 'Licence FFA',
  registration: "Certificat d'inscription",
  medical_certificate: 'Certificat médical',
  other: 'Autre document',
}

const STATUS_STYLES: Record = {
  pending: 'bg-yellow-50 text-yellow-700 ring-yellow-200',
  valid: 'bg-green-50  text-green-700  ring-green-200',
  expired: 'bg-red-50    text-red-700    ring-red-200',
}

const STATUS_LABELS: Record = {
  pending: 'En attente',
  valid: 'Valide',
  expired: 'Expiré',
}

interface Props {
  document: UserDocument
  onDeleted: (id: number) => void
}

export default function DocumentCard({ document, onDeleted }: Props) {
  const [isDownloading, setDownloading] = useState(false)
  const [isDeleting, setDeleting] = useState(false)

  const handleDownload = async () => {
    setDownloading(true)
    try {
      const { url } = await getDocumentDownloadUrl(document.id)
      window.open(url, '_blank', 'noopener,noreferrer')
    } finally {
      setDownloading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm(`Supprimer "${TYPE_LABELS[document.type]}" ?`)) return
    setDeleting(true)
    try {
      await deleteDocument(document.id)
      onDeleted(document.id)
    } finally {
      setDeleting(false)
    }
  }

  const status = document.status as keyof typeof STATUS_STYLES

  return (
    <div className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white px-4 py-3">
      <div className="flex items-center gap-3">
        {/* Icône type */}
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-xl">
          📄
        </div>
        <div>
          <p className="text-sm font-medium text-zinc-900">
            {TYPE_LABELS[document.type] ?? document.type}
          </p>
          <p className="text-xs text-zinc-400">
            {document.filename}
            {document.expires_at && (
              <> · expire le {new Date(document.expires_at).toLocaleDateString('fr-FR')}</>
            )}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Badge statut */}
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${STATUS_STYLES[status] ?? STATUS_STYLES.pending}`}
        >
          {STATUS_LABELS[status] ?? 'Inconnu'}
        </span>

        {/* Télécharger */}
        <button
          onClick={handleDownload}
          disabled={isDownloading}
          className="rounded-lg p-1.5 text-zinc-500 transition hover:bg-zinc-100 disabled:opacity-50"
          title="Télécharger"
        >
          {isDownloading ? '…' : '⬇'}
        </button>

        {/* Supprimer */}
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="rounded-lg p-1.5 text-red-400 transition hover:bg-red-50 disabled:opacity-50"
          title="Supprimer"
        >
          {isDeleting ? '…' : '🗑'}
        </button>
      </div>
    </div>
  )
}
