'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import type { Event, EventType } from '@/types'
import { getEvents } from '@/lib/events'

const TYPE_LABELS: Record<EventType, string> = {
  race: 'Course', outing: 'Sortie', competition: 'Compétition', other: 'Autre',
}

const TYPE_COLORS: Record<EventType, string> = {
  race:        'bg-red-100 text-red-700',
  outing:      'bg-green-100 text-green-700',
  competition: 'bg-purple-100 text-purple-700',
  other:       'bg-zinc-100 text-zinc-600',
}

export default function PublicEventsPage() {
  const [events,  setEvents]  = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    try {
      const res = await getEvents({ upcoming: true, page: 1 })
      setEvents(res.data)
    } catch {
      // silencieux
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetch() }, [fetch])

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-zinc-900">Événements à venir</h1>
        <p className="mt-2 text-zinc-500">Rejoignez-nous pour nos prochaines sorties et compétitions.</p>
      </div>

      {loading ? (
        <div className="text-sm text-zinc-400">Chargement…</div>
      ) : events.length === 0 ? (
        <div className="rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-zinc-200 text-sm text-zinc-400">
          Aucun événement à venir pour le moment.
        </div>
      ) : (
        <div className="space-y-3">
          {events.map((event) => {
            const date = new Date(event.event_date)
            return (
              <div key={event.id} className="flex items-center gap-4 rounded-2xl bg-white px-5 py-4 shadow-sm ring-1 ring-zinc-200">
                {/* Date */}
                <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-brand text-white">
                  <span className="text-xs font-semibold uppercase">
                    {date.toLocaleDateString('fr-FR', { month: 'short' })}
                  </span>
                  <span className="text-xl font-bold leading-none">{date.getDate()}</span>
                </div>

                {/* Infos */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${TYPE_COLORS[event.type]}`}>
                      {TYPE_LABELS[event.type]}
                    </span>
                  </div>
                  <p className="font-semibold text-zinc-900 truncate">{event.title}</p>
                  <p className="text-sm text-zinc-500 truncate">📍 {event.location} · 👥 {event.registrations_count} inscrit{event.registrations_count > 1 ? 's' : ''}</p>
                </div>

                {/* CTA */}
                <Link
                  href="/connexion"
                  className="shrink-0 rounded-xl bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark transition"
                >
                  S'inscrire
                </Link>
              </div>
            )
          })}
        </div>
      )}

      <p className="text-center text-sm text-zinc-400">
        <Link href="/connexion" className="text-brand hover:underline">Connectez-vous</Link> pour vous inscrire aux événements.
      </p>
    </div>
  )
}
