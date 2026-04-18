'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import type { Event, EventPhoto, EventType } from '@/types'
import {
  getEvent,
  registerToEvent,
  unregisterFromEvent,
  deleteEvent,
  getEventPhotos,
  uploadEventPhoto,
  deleteEventPhoto,
} from '@/lib/events'
import { useRole } from '@/hooks/useRole'
import { useToast } from '@/components/ui/Toast'
import { useAuthStore } from '@/store/auth.store'
import Link from 'next/link'

const TYPE_LABELS: Record = {
  race: 'Course',
  outing: 'Sortie',
  competition: 'Compétition',
  other: 'Autre',
}

const TYPE_COLORS: Record = {
  race: 'bg-red-100 text-red-700',
  outing: 'bg-green-100 text-green-700',
  competition: 'bg-purple-100 text-purple-700',
  other: 'bg-zinc-100 text-zinc-600',
}

interface Props {
  eventId: number
}

export default function EventDetailPage({ eventId }: Props) {
  const router = useRouter()
  const { canManageEvents } = useRole()
  const { toast } = useToast()
  const { user } = useAuthStore()

  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [regLoading, setRegLoading] = useState(false)

  // Photos
  const [photos, setPhotos] = useState<EventPhoto[]>([])
  const [photosLoading, setPhotosLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setLoading(true)
    getEvent(eventId)
      .then((ev) => {
        setEvent(ev)
        // Load photos for past events
        const isPastEvent = new Date(ev.event_date) < new Date()
        if (isPastEvent) {
          setPhotosLoading(true)
          getEventPhotos(eventId)
            .then(setPhotos)
            .catch(() => setPhotos([]))
            .finally(() => setPhotosLoading(false))
        }
      })
      .catch(() => setError('Événement introuvable.'))
      .finally(() => setLoading(false))
  }, [eventId])

  const handleToggleRegistration = async () => {
    if (!event) return
    setRegLoading(true)
    try {
      if (event.is_registered) {
        const res = await unregisterFromEvent(event.id)
        setEvent({ ...event, is_registered: false, registrations_count: res.registrations_count })
        toast('Désinscription effectuée.', 'info')
      } else {
        const res = await registerToEvent(event.id)
        setEvent({ ...event, is_registered: true, registrations_count: res.registrations_count })
        toast('Inscription confirmée ! 🎉', 'success')
      }
    } catch {
      toast('Une erreur est survenue.', 'error')
    } finally {
      setRegLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!event || !confirm(`Supprimer "${event.title}" ?`)) return
    try {
      await deleteEvent(event.id)
      toast('Événement supprimé.', 'info')
      router.push('/tableau-de-bord/evenements')
    } catch {
      toast('Erreur lors de la suppression.', 'error')
    }
  }

  const handlePhotoUpload = async (e: React.ChangeEvent) => {
    if (!event) return
    const file = e.target.files?.[0]
    if (!file) return
    if (photos.length >= 20) {
      toast('Maximum 20 photos par événement.', 'error')
      return
    }
    setUploading(true)
    try {
      const newPhoto = await uploadEventPhoto(event.id, file)
      setPhotos((prev) => [...prev, newPhoto])
      toast('Photo ajoutée.', 'success')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erreur lors de l'upload."
      toast(msg, 'error')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handlePhotoDelete = async (photoId: number) => {
    if (!confirm('Supprimer cette photo ?')) return
    try {
      await deleteEventPhoto(photoId)
      setPhotos((prev) => prev.filter((p) => p.id !== photoId))
      if (lightboxIdx !== null) setLightboxIdx(null)
      toast('Photo supprimée.', 'info')
    } catch {
      toast('Erreur lors de la suppression.', 'error')
    }
  }

  if (loading) {
    return (
      <div className="flex h-60 items-center justify-center text-sm text-zinc-400">Chargement…</div>
    )
  }

  if (error || !event) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {error ?? 'Erreur inconnue'}
        </div>
        <Link
          href="/tableau-de-bord/evenements"
          className="text-primary mt-4 inline-block text-sm hover:underline"
        >
          ← Retour aux événements
        </Link>
      </div>
    )
  }

  const date = new Date(event.event_date)
  const isPast = date < new Date()
  const dateStr = date.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  const timeStr = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-8">
      {/* Retour */}
      <Link
        href="/tableau-de-bord/evenements"
        className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-800"
      >
        ← Retour aux événements
      </Link>

      {/* Card principale */}
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-zinc-200">
        {/* Header */}
        <div className="border-b border-zinc-100 bg-zinc-50 px-6 py-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="mb-2 flex flex-wrap gap-2">
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${TYPE_COLORS[event.type]}`}
                >
                  {TYPE_LABELS[event.type]}
                </span>
                {!event.is_public && (
                  <span className="rounded-full bg-zinc-200 px-2.5 py-0.5 text-xs font-medium text-zinc-600">
                    Privé
                  </span>
                )}
                {isPast && (
                  <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-500">
                    Terminé
                  </span>
                )}
              </div>
              <h1 className="text-xl font-bold text-zinc-900">{event.title}</h1>
            </div>

            {canManageEvents && (
              <div className="flex shrink-0 gap-2">
                <Link
                  href={`/tableau-de-bord/evenements/${event.id}/modifier`}
                  className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs text-zinc-600 hover:bg-zinc-100"
                >
                  Modifier
                </Link>
                <button
                  onClick={handleDelete}
                  className="rounded-lg border border-red-200 px-3 py-1.5 text-xs text-red-500 hover:bg-red-50"
                >
                  Supprimer
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Infos */}
        <div className="space-y-4 px-6 py-5">
          {/* Date / lieu */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 text-xl">📅</span>
              <div>
                <p className="text-xs font-medium tracking-wide text-zinc-400 uppercase">Date</p>
                <p className="text-sm text-zinc-800 capitalize">{dateStr}</p>
                <p className="text-sm text-zinc-500">{timeStr}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="mt-0.5 text-xl">📍</span>
              <div>
                <p className="text-xs font-medium tracking-wide text-zinc-400 uppercase">Lieu</p>
                <p className="text-sm text-zinc-800">{event.location}</p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <p className="mb-2 text-xs font-medium tracking-wide text-zinc-400 uppercase">
              Description
            </p>
            <p className="text-sm whitespace-pre-wrap text-zinc-700">{event.description}</p>
          </div>

          {/* Inscrits */}
          <div className="flex items-center gap-2 rounded-xl bg-zinc-50 px-4 py-3">
            <span className="text-xl">👥</span>
            <div>
              <p className="text-sm font-medium text-zinc-800">
                {event.registrations_count} inscrit{event.registrations_count > 1 ? 's' : ''}
              </p>
              {/* Seuls les membres connectés voient ce message */}
              {user && (
                <p className="text-xs text-zinc-500">
                  {event.is_registered
                    ? 'Vous êtes inscrit(e)'
                    : "Vous n'êtes pas encore inscrit(e)"}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* CTA inscription */}
        {user && !isPast && (
          <div className="border-t border-zinc-100 px-6 py-4">
            <button
              onClick={handleToggleRegistration}
              disabled={regLoading}
              className={`w-full rounded-xl py-2.5 text-sm font-medium transition disabled:opacity-50 ${
                event.is_registered
                  ? 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                  : 'bg-primary hover:bg-primary-dark text-white'
              }`}
            >
              {regLoading
                ? '…'
                : event.is_registered
                  ? 'Se désinscrire'
                  : "S'inscrire à cet événement"}
            </button>
          </div>
        )}
      </div>

      {/* ── Galerie photos (événements passés) ── */}
      {isPast && (
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-zinc-200">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-4">
            <div>
              <h2 className="text-base font-bold text-zinc-800">Galerie photos</h2>
              <p className="mt-0.5 text-xs text-zinc-400">{photos.length} / 20 photos</p>
            </div>
            {/* Upload button — admin, founder, or event creator */}
            {user && (canManageEvents || user.id === event.created_by) && photos.length < 20 && (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  style={{ display: 'none' }}
                  onChange={handlePhotoUpload}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white transition disabled:opacity-50"
                  style={{ background: '#FB3936', boxShadow: '0 2px 8px rgba(251,57,54,0.25)' }}
                >
                  {uploading ? (
                    'Envoi…'
                  ) : (
                    <>
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                      Ajouter une photo
                    </>
                  )}
                </button>
              </>
            )}
          </div>

          {/* Photos grid */}
          <div className="p-6">
            {photosLoading ? (
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="aspect-square animate-pulse rounded-xl"
                    style={{ background: 'rgba(192,48,46,0.06)' }}
                  />
                ))}
              </div>
            ) : photos.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <svg
                  width="40"
                  height="40"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ color: 'rgba(192,48,46,0.25)', marginBottom: '0.75rem' }}
                >
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
                <p
                  className="text-sm font-semibold"
                  style={{ color: '#C0302E', marginBottom: '0.25rem' }}
                >
                  Aucune photo pour l&apos;instant
                </p>
                {user && (canManageEvents || user.id === event.created_by) ? (
                  <p className="text-xs" style={{ color: '#7F7F7F' }}>
                    Partagez les souvenirs de cette sortie — les photos sont pour toujours !
                  </p>
                ) : (
                  <p className="text-xs" style={{ color: '#7F7F7F' }}>
                    Les organisateurs peuvent ajouter des souvenirs de cette sortie.
                  </p>
                )}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-3 gap-3 sm:grid-cols-3">
                  {photos.map((photo, idx) => (
                    <div
                      key={photo.id}
                      className="group relative aspect-square overflow-hidden rounded-xl"
                    >
                      <button onClick={() => setLightboxIdx(idx)} className="h-full w-full">
                        <Image
                          src={photo.url}
                          alt={`Photo ${idx + 1}`}
                          fill
                          className="object-cover transition group-hover:scale-105"
                          sizes="(max-width: 640px) 33vw, 200px"
                        />
                      </button>
                      {/* Delete button */}
                      {user &&
                        (canManageEvents ||
                          user.id === event.created_by ||
                          user.id === photo.uploaded_by) && (
                          <button
                            onClick={() => handlePhotoDelete(photo.id)}
                            className="absolute top-1.5 right-1.5 hidden h-7 w-7 items-center justify-center rounded-full bg-red-500 text-white shadow group-hover:flex"
                          >
                            <svg
                              width="12"
                              height="12"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="3"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <line x1="18" y1="6" x2="6" y2="18" />
                              <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                          </button>
                        )}
                    </div>
                  ))}
                </div>

                {/* Lightbox */}
                {lightboxIdx !== null && photos[lightboxIdx] && (
                  <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
                    onClick={() => setLightboxIdx(null)}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setLightboxIdx((i) => (i !== null && i > 0 ? i - 1 : i))
                      }}
                      disabled={lightboxIdx === 0}
                      className="absolute top-1/2 left-4 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white disabled:opacity-30"
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="15 18 9 12 15 6" />
                      </svg>
                    </button>
                    <div
                      className="relative max-h-[85vh] max-w-[90vw]"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Image
                        src={photos[lightboxIdx].url}
                        alt={`Photo ${lightboxIdx + 1}`}
                        width={1200}
                        height={800}
                        className="max-h-[85vh] max-w-[90vw] rounded-lg object-contain"
                      />
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setLightboxIdx((i) => (i !== null && i < photos.length - 1 ? i + 1 : i))
                      }}
                      disabled={lightboxIdx === photos.length - 1}
                      className="absolute top-1/2 right-4 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white disabled:opacity-30"
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setLightboxIdx(null)}
                      className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
