'use client'

import { useToast } from '@/components/ui/Toast'
import { useRole } from '@/hooks/useRole'
import { deleteEvent, registerToEvent, unregisterFromEvent } from '@/lib/events'
import type { Event } from '@/types'
import Link from 'next/link'
import { useState } from 'react'

const TYPE_LABELS: Record = {
  race: 'Course',
  outing: 'Sortie',
  competition: 'Compétition',
  other: 'Autre',
}

const TYPE_CONFIG: Record = {
  race: {
    bg: 'rgba(251,57,54,0.08)',
    border: 'rgba(251,57,54,0.2)',
    color: '#FB3936',
    headerBg: 'rgba(251,57,54,0.05)',
  },
  outing: {
    bg: 'rgba(192,48,46,0.08)',
    border: 'rgba(192,48,46,0.2)',
    color: '#C0302E',
    headerBg: 'rgba(192,48,46,0.05)',
  },
  competition: {
    bg: 'rgba(245,158,11,0.10)',
    border: 'rgba(245,158,11,0.25)',
    color: '#d97706',
    headerBg: 'rgba(245,158,11,0.06)',
  },
  other: {
    bg: 'rgba(176,137,138,0.10)',
    border: 'rgba(176,137,138,0.2)',
    color: '#7F7F7F',
    headerBg: 'rgba(176,137,138,0.05)',
  },
}

function IconPin() {
  return (
    <svg
      width={12}
      height={12}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
      <circle cx="12" cy="9" r="2.5" />
    </svg>
  )
}

function IconClock() {
  return (
    <svg
      width={12}
      height={12}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  )
}

function IconUsers() {
  return (
    <svg
      width={12}
      height={12}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}

interface Props {
  event: Event
  onUpdate: (updated: Event) => void
  onDelete: (id: number) => void
  onEdit?: (event: Event) => void
}

export default function EventCard({ event, onUpdate, onDelete, onEdit }: Props) {
  const { canManageEvents } = useRole()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const date = new Date(event.event_date)
  const day = date.getDate()
  const month = date.toLocaleDateString('fr-FR', { month: 'short' })
  const weekday = date.toLocaleDateString('fr-FR', { weekday: 'short' })
  const time = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  const isPast = date < new Date()
  const cfg = TYPE_CONFIG[event.type] ?? TYPE_CONFIG.other

  const handleToggleRegistration = async () => {
    setLoading(true)
    try {
      if (event.is_registered) {
        const res = await unregisterFromEvent(event.id)
        onUpdate({ ...event, is_registered: false, registrations_count: res.registrations_count })
        toast('Désinscription effectuée.', 'info')
      } else {
        const res = await registerToEvent(event.id)
        onUpdate({ ...event, is_registered: true, registrations_count: res.registrations_count })
        toast('Inscription confirmée !', 'success')
      }
    } catch {
      toast('Une erreur est survenue.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm(`Supprimer "${event.title}" ?`)) return
    try {
      await deleteEvent(event.id)
      onDelete(event.id)
      toast('Événement supprimé.', 'info')
    } catch {
      toast('Erreur lors de la suppression.', 'error')
    }
  }

  return (
    <div
      className="flex flex-col overflow-hidden rounded-2xl bg-white transition-all"
      style={{
        opacity: isPast ? 0.65 : 1,
        boxShadow: '0 2px 8px rgba(192,48,46,0.07)',
        border: `1px solid ${cfg.border}`,
      }}
    >
      {/* Header avec date badge */}
      <div
        className="flex items-center gap-3 px-4 py-3.5"
        style={{ background: cfg.headerBg, borderBottom: `1px solid ${cfg.border}` }}
      >
        {/* Date badge */}
        <div
          className="flex h-13 w-11 shrink-0 flex-col items-center justify-center rounded-xl text-center"
          style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}
        >
          <span
            className="text-[9px] leading-none font-bold uppercase"
            style={{ color: cfg.color, opacity: 0.8 }}
          >
            {weekday}
          </span>
          <span className="text-xl leading-tight font-extrabold" style={{ color: cfg.color }}>
            {day}
          </span>
          <span
            className="text-[9px] leading-none uppercase"
            style={{ color: cfg.color, opacity: 0.7 }}
          >
            {month}
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-1.5">
            <span
              className="rounded-full px-2 py-0.5 text-[10px] font-bold"
              style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}
            >
              {TYPE_LABELS[event.type]}
            </span>
            {!event.is_public && (
              <span
                className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                style={{ background: 'rgba(192,48,46,0.06)', color: '#7F7F7F' }}
              >
                Privé
              </span>
            )}
            {isPast && (
              <span
                className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                style={{ background: 'rgba(192,48,46,0.05)', color: '#7F7F7F' }}
              >
                Terminé
              </span>
            )}
          </div>
          <h3 className="truncate leading-tight font-bold" style={{ color: '#C0302E' }}>
            {event.title}
          </h3>
        </div>
      </div>

      {/* Corps */}
      <div className="flex flex-1 flex-col gap-3 px-4 py-4">
        {event.description && (
          <p className="line-clamp-2 text-sm leading-relaxed" style={{ color: '#7F7F7F' }}>
            {event.description}
          </p>
        )}

        <div className="mt-auto space-y-1.5">
          {event.location && (
            <div className="flex items-center gap-2 text-xs" style={{ color: '#7F7F7F' }}>
              <span className="shrink-0">
                <IconPin />
              </span>
              <span className="truncate">{event.location}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-xs" style={{ color: '#7F7F7F' }}>
            <span className="shrink-0">
              <IconClock />
            </span>
            <span>
              {weekday} {day} {month} à {time}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs" style={{ color: '#7F7F7F' }}>
            <span className="shrink-0">
              <IconUsers />
            </span>
            <span>
              {event.registrations_count} inscrit{event.registrations_count > 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Footer actions */}
      <div
        className="flex items-center justify-between gap-2 px-4 py-2.5"
        style={{ borderTop: '1px solid rgba(192,48,46,0.06)' }}
      >
        <div className="flex gap-0.5">
          <Link
            href={`/tableau-de-bord/evenements/${event.id}`}
            className="rounded-lg px-2.5 py-1.5 text-xs font-medium transition"
            style={{ color: '#D42F2D' }}
          >
            Détails
          </Link>
          {canManageEvents && onEdit && (
            <button
              onClick={() => onEdit(event)}
              className="rounded-lg px-2.5 py-1.5 text-xs font-medium transition"
              style={{ color: '#D42F2D' }}
            >
              Modifier
            </button>
          )}
          {canManageEvents && (
            <button
              onClick={handleDelete}
              className="rounded-lg px-2.5 py-1.5 text-xs font-medium transition"
              style={{ color: '#D42F2D' }}
            >
              Supprimer
            </button>
          )}
        </div>

        {!isPast && (
          <button
            onClick={handleToggleRegistration}
            disabled={loading}
            className="rounded-xl px-3.5 py-1.5 text-xs font-bold text-white transition disabled:opacity-50"
            style={{
              background: event.is_registered
                ? '#7F7F7F'
                : `linear-gradient(135deg, ${cfg.color} 0%, ${cfg.color}dd 100%)`,
              boxShadow: event.is_registered ? 'none' : `0 2px 6px ${cfg.color}40`,
            }}
          >
            {loading ? '…' : event.is_registered ? '✓ Inscrit' : "S'inscrire"}
          </button>
        )}
      </div>
    </div>
  )
}
