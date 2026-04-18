'use client'

import { useState } from 'react'
import type { ComponentType } from 'react'
import type { TrainingSession, SessionType, Intensity } from '@/types'
import { toggleParticipation, deleteSession } from '@/lib/sessions'
import { useRole } from '@/hooks/useRole'
import { useToast } from '@/components/ui/Toast'
import { Timer, Zap, Wind, HeartPulse, Dumbbell, ClipboardList, Check } from 'lucide-react'

const TYPE_LABELS: Record = {
  running: 'Course',
  interval: 'Interval',
  fartlek: 'Fartlek',
  recovery: 'Récupération',
  strength: 'Renforcement',
  other: 'Autre',
}

const TYPE_ICONS: Record = {
  running: Timer,
  interval: Zap,
  fartlek: Wind,
  recovery: HeartPulse,
  strength: Dumbbell,
  other: ClipboardList,
}

const INTENSITY_LABELS: Record = {
  low: 'Faible',
  medium: 'Moyenne',
  high: 'Élevée',
}

const INTENSITY_COLORS: Record = {
  low: 'bg-green-100 text-green-700',
  medium: 'bg-amber-100 text-amber-700',
  high: 'bg-red-100 text-red-700',
}

interface Props {
  session: TrainingSession
  onUpdate: (updated: TrainingSession) => void
  onDelete: (id: number) => void
  onEdit?: (session: TrainingSession) => void
  isTemplate?: boolean
}

export default function SessionCard({
  session,
  onUpdate,
  onDelete,
  onEdit,
  isTemplate = false,
}: Props) {
  const { canManageSessions } = useRole()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const handleParticipation = async () => {
    setLoading(true)
    try {
      const res = await toggleParticipation(session.id)
      onUpdate({
        ...session,
        has_participated: res.has_participated,
        participants_count: res.participants_count,
      })
      toast(
        res.has_participated ? 'Participation enregistrée !' : 'Participation retirée.',
        res.has_participated ? 'success' : 'info'
      )
    } catch {
      toast('Une erreur est survenue.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm(`Supprimer "${session.title}" ?`)) return
    try {
      await deleteSession(session.id)
      onDelete(session.id)
      toast('Session supprimée.', 'info')
    } catch {
      toast('Erreur lors de la suppression.', 'error')
    }
  }

  const exerciseCount = session.exercises?.length ?? 0
  const TypeIcon = TYPE_ICONS[session.type]

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-zinc-200">
      {/* Header */}
      <div className="flex items-start gap-3 border-b border-zinc-100 bg-zinc-50 px-5 py-4">
        <TypeIcon size={24} className="text-sf-bark-red mt-0.5 shrink-0" />
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap gap-1.5">
            <span className="rounded-full bg-zinc-200 px-2 py-0.5 text-xs font-medium text-zinc-600">
              {TYPE_LABELS[session.type]}
            </span>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${INTENSITY_COLORS[session.intensity]}`}
            >
              {INTENSITY_LABELS[session.intensity]}
            </span>
          </div>
          <h3 className="truncate font-semibold text-zinc-900">{session.title}</h3>
        </div>
      </div>

      {/* Stats */}
      <div className="flex divide-x divide-zinc-100 border-b border-zinc-100">
        {session.distance_km != null && (
          <div className="flex-1 px-4 py-2 text-center">
            <p className="text-lg font-bold text-zinc-800">{session.distance_km}</p>
            <p className="text-xs text-zinc-400">km</p>
          </div>
        )}
        {session.duration_min != null && (
          <div className="flex-1 px-4 py-2 text-center">
            <p className="text-lg font-bold text-zinc-800">{session.duration_min}</p>
            <p className="text-xs text-zinc-400">min</p>
          </div>
        )}
        {exerciseCount > 0 && (
          <div className="flex-1 px-4 py-2 text-center">
            <p className="text-lg font-bold text-zinc-800">{exerciseCount}</p>
            <p className="text-xs text-zinc-400">exercice{exerciseCount > 1 ? 's' : ''}</p>
          </div>
        )}
        <div className="flex-1 px-4 py-2 text-center">
          <p className="text-lg font-bold text-zinc-800">{session.participants_count ?? 0}</p>
          <p className="text-xs text-zinc-400">
            participant{(session.participants_count ?? 0) > 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Date et lieu */}
      {(session.session_date || session.location) && (
        <div className="flex flex-wrap gap-x-4 gap-y-1 border-b border-zinc-100 px-5 py-2.5">
          {session.session_date && (
            <p className="text-xs text-zinc-500">
              <span className="font-medium text-zinc-700">
                {new Date(session.session_date).toLocaleDateString('fr-FR', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
              {' à '}
              {new Date(session.session_date).toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          )}
          {session.location && (
            <p className="text-xs text-zinc-500">
              <span className="font-medium text-zinc-700">{session.location.name}</span>
            </p>
          )}
        </div>
      )}

      {/* Description */}
      {session.description && (
        <div className="px-5 py-3">
          <p className="line-clamp-2 text-sm text-zinc-600">{session.description}</p>
        </div>
      )}

      {/* Exercices preview */}
      {exerciseCount > 0 && (
        <div className="px-5 pb-3">
          <p className="mb-1.5 text-xs font-medium text-zinc-400">Exercices</p>
          <div className="space-y-1">
            {session.exercises.slice(0, 3).map((ex, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-zinc-600">
                <span className="h-1 w-1 shrink-0 rounded-full bg-zinc-300" />
                <span className="font-medium">{ex.name}</span>
                {ex.sets && ex.reps && (
                  <span className="text-zinc-400">
                    {ex.sets}×{ex.reps}
                  </span>
                )}
                {ex.duration && <span className="text-zinc-400">{ex.duration}s</span>}
                {ex.rest && <span className="text-zinc-400">repos {ex.rest}s</span>}
              </div>
            ))}
            {exerciseCount > 3 && (
              <p className="text-xs text-zinc-400">
                +{exerciseCount - 3} autre{exerciseCount > 4 ? 's' : ''}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="mt-auto flex items-center justify-between gap-2 border-t border-zinc-100 px-5 py-3">
        <div className="flex gap-1">
          {canManageSessions && !isTemplate && onEdit && (
            <button
              onClick={() => onEdit(session)}
              className="rounded-lg px-2 py-1 text-xs text-zinc-500 transition hover:bg-zinc-100"
            >
              Modifier
            </button>
          )}
          {canManageSessions && (
            <button
              onClick={handleDelete}
              className="rounded-lg px-2 py-1 text-xs text-red-500 transition hover:bg-red-50"
            >
              Supprimer
            </button>
          )}
        </div>

        {!isTemplate && (
          <button
            onClick={handleParticipation}
            disabled={loading}
            className={`flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-sm font-medium transition disabled:opacity-50 ${
              session.has_participated
                ? 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                : 'bg-primary hover:bg-primary-dark text-white'
            }`}
          >
            {loading ? (
              '…'
            ) : session.has_participated ? (
              <>
                <Check size={14} /> Participé
              </>
            ) : (
              'Je participe'
            )}
          </button>
        )}
      </div>
    </div>
  )
}
