'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import type { Event, EventType } from '@/types'
import { getEvents, type EventFilters } from '@/lib/events'
import { useRole } from '@/hooks/useRole'
import EventCard from './EventCard'
import EventForm from './EventForm'
import CalendarView from './CalendarView'

type ViewMode = 'list' | 'calendar'

const TYPE_OPTIONS: { value: EventType | ''; label: string; color: string }[] = [
  { value: '',            label: 'Tous',        color: '#7F7F7F' },
  { value: 'race',        label: 'Course',      color: '#FB3936' },
  { value: 'outing',      label: 'Sortie',      color: '#D42F2D' },
  { value: 'competition', label: 'Compétition', color: '#d97706' },
  { value: 'other',       label: 'Autre',       color: '#7F7F7F' },
]

function IconCalendar() {
  return (
    <svg width={26} height={26} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="3"/>
      <path d="M16 2v4M8 2v4M3 10h18"/>
    </svg>
  )
}

function IconList() {
  return (
    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
      <circle cx="3" cy="6" r="1.5" fill="currentColor" stroke="none"/><circle cx="3" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="3" cy="18" r="1.5" fill="currentColor" stroke="none"/>
    </svg>
  )
}

function IconGrid() {
  return (
    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
    </svg>
  )
}

function IconEmptyCalendar() {
  return (
    <svg width={48} height={48} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="3"/>
      <path d="M16 2v4M8 2v4M3 10h18"/>
      <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/>
    </svg>
  )
}

export default function EventsPage() {
  const router = useRouter()
  const { canManageEvents } = useRole()

  const [view,      setView]      = useState<ViewMode>('list')
  const [events,    setEvents]    = useState<Event[]>([])
  const [allEvents, setAllEvents] = useState<Event[]>([])
  const [meta,      setMeta]      = useState({ current_page: 1, last_page: 1, total: 0, per_page: 12 })
  const [filters,   setFilters]   = useState<EventFilters>({ upcoming: true, page: 1 })
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState<string | null>(null)
  const [showForm,  setShowForm]  = useState(false)
  const [editEvent, setEditEvent] = useState<Event | undefined>()

  const fetchEvents = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const res = await getEvents(filters)
      setEvents(res.data); setMeta(res.meta)
    } catch { setError('Impossible de charger les événements.') }
    finally { setLoading(false) }
  }, [filters])

  const fetchAllForCalendar = useCallback(async () => {
    try {
      const res = await getEvents({ upcoming: false, page: 1 })
      const pages = res.meta.last_page
      if (pages === 1) { setAllEvents(res.data) }
      else {
        const rest = await Promise.all(
          Array.from({ length: pages - 1 }, (_, i) => getEvents({ upcoming: false, page: i + 2 }))
        )
        setAllEvents([...res.data, ...rest.flatMap((r) => r.data)])
      }
    } catch { /* silencieux */ }
  }, [])

  useEffect(() => { fetchEvents() }, [fetchEvents])
  useEffect(() => { if (view === 'calendar') fetchAllForCalendar() }, [view, fetchAllForCalendar])

  const handleUpdate = (updated: Event) => {
    setEvents((p)    => p.map((e) => e.id === updated.id ? updated : e))
    setAllEvents((p) => p.map((e) => e.id === updated.id ? updated : e))
  }
  const handleDelete = (id: number) => {
    setEvents((p)    => p.filter((e) => e.id !== id))
    setAllEvents((p) => p.filter((e) => e.id !== id))
    setMeta((m) => ({ ...m, total: m.total - 1 }))
  }
  const handleEdit = (event: Event) => { setEditEvent(event); setShowForm(true) }
  const handleFormSuccess = (saved: Event) => {
    if (editEvent) { handleUpdate(saved) }
    else { setEvents((p) => [saved, ...p]); setAllEvents((p) => [saved, ...p]); setMeta((m) => ({ ...m, total: m.total + 1 })) }
    setShowForm(false); setEditEvent(undefined)
  }

  const activeType = filters.type ?? ''
  const hasActiveFilter = !!filters.type || !filters.upcoming

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@400;500;600;700;800&display=swap');
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .ev-page { font-family: 'Baloo 2', sans-serif; }
        .ev-fade { animation: fadeUp 0.4s ease both; }
        .ev-view-btn {
          display: flex; align-items: center; gap: 6px;
          padding: 6px 14px; font-size: 13px; font-weight: 600;
          transition: all 0.2s ease; cursor: pointer; border: none;
        }
        .ev-view-btn.active { background: white; color: #C0302E; box-shadow: 0 1px 4px rgba(192,48,46,0.1); border-radius: 10px; }
        .ev-view-btn:not(.active) { background: transparent; color: #7F7F7F; border-radius: 10px; }
        .ev-type-pill {
          padding: 5px 14px; border-radius: 20px; font-size: 12px;
          font-weight: 600; transition: all 0.2s ease; cursor: pointer; white-space: nowrap;
        }
        .ev-type-pill.active { background: #FB3936; color: white; box-shadow: 0 2px 8px rgba(251,57,54,0.3); border: 1px solid transparent; }
        .ev-type-pill:not(.active) { background: white; color: #7F7F7F; border: 1px solid rgba(192,48,46,0.1); }
        .ev-type-pill:not(.active):hover { background: #FAFAFA; color: #C0302E; }
        .ev-upcoming-toggle { display: flex; align-items: center; gap: 8px; cursor: pointer; }
        .ev-upcoming-toggle input[type=checkbox] { accent-color: #FB3936; width: 15px; height: 15px; }
      `}</style>

      <div className="ev-page min-h-screen pb-24 lg:pb-8" style={{ background: '#F8F8F8' }}>
        <div className="mx-auto max-w-5xl px-5 py-8">

          {/* ── Header ─────────────────────────────────────────────────── */}
          <div className="ev-fade mb-8 flex items-start justify-between" style={{ animationDelay: '0ms' }}>
            <div>
              <div className="mb-1 flex items-center gap-2" style={{ color: '#D42F2D' }}>
                <IconCalendar />
                <h1 className="text-3xl font-extrabold" style={{ letterSpacing: '-0.02em', color: '#C0302E' }}>
                  Événements
                </h1>
              </div>
              <p className="text-sm" style={{ color: '#7F7F7F' }}>
                Sorties, courses et compétitions — inscrivez-vous et partagez des photos.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {/* View toggle */}
              <div
                className="flex gap-0.5 rounded-xl p-1"
                style={{ background: 'rgba(192,48,46,0.05)' }}
              >
                <button onClick={() => setView('list')}     className={`ev-view-btn ${view === 'list'     ? 'active' : ''}`}>
                  <IconList /> Liste
                </button>
                <button onClick={() => setView('calendar')} className={`ev-view-btn ${view === 'calendar' ? 'active' : ''}`}>
                  <IconGrid /> Calendrier
                </button>
              </div>

              {canManageEvents && !showForm && (
                <button
                  onClick={() => { setEditEvent(undefined); setShowForm(true) }}
                  className="rounded-xl px-4 py-2.5 text-sm font-bold text-white transition"
                  style={{ background: 'linear-gradient(135deg, #FB3936 0%, #D42F2D 100%)', boxShadow: '0 2px 8px rgba(251,57,54,0.3)' }}
                >
                  + Nouveau
                </button>
              )}
            </div>
          </div>

          {/* ── Form ───────────────────────────────────────────────────── */}
          {showForm && (
            <div
              className="ev-fade mb-6 overflow-hidden rounded-2xl bg-white"
              style={{ animationDelay: '40ms', boxShadow: '0 4px 20px rgba(192,48,46,0.08)', border: '1px solid rgba(192,48,46,0.08)' }}
            >
              <div className="px-6 py-4" style={{ background: 'linear-gradient(135deg, rgba(176,137,138,0.08) 0%, rgba(251,57,54,0.04) 100%)', borderBottom: '1px solid rgba(192,48,46,0.06)' }}>
                <h2 className="font-bold" style={{ color: '#C0302E' }}>
                  {editEvent ? "Modifier l'événement" : 'Nouvel événement'}
                </h2>
              </div>
              <div className="p-6">
                <EventForm
                  event={editEvent}
                  onSuccess={handleFormSuccess}
                  onCancel={() => { setShowForm(false); setEditEvent(undefined) }}
                />
              </div>
            </div>
          )}

          {/* ── Calendar view ───────────────────────────────────────────── */}
          {view === 'calendar' && (
            <div className="ev-fade" style={{ animationDelay: '60ms' }}>
              <CalendarView
                events={allEvents}
                onEventClick={(ev) => router.push(`/tableau-de-bord/evenements/${ev.id}`)}
              />
            </div>
          )}

          {/* ── List view ──────────────────────────────────────────────── */}
          {view === 'list' && (
            <>
              {/* Filters */}
              <div className="ev-fade mb-5 flex flex-wrap items-center gap-3" style={{ animationDelay: '80ms' }}>
                <div className="flex flex-wrap gap-2">
                  {TYPE_OPTIONS.map((o) => (
                    <button
                      key={o.value}
                      onClick={() => setFilters((f) => ({ ...f, type: o.value as EventType | '', page: 1 }))}
                      className={`ev-type-pill ${activeType === o.value ? 'active' : ''}`}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>

                <label className="ev-upcoming-toggle ml-auto">
                  <input
                    type="checkbox"
                    checked={!!filters.upcoming}
                    onChange={(e) => setFilters((f) => ({ ...f, upcoming: e.target.checked, page: 1 }))}
                  />
                  <span className="text-xs font-semibold" style={{ color: '#7F7F7F' }}>À venir uniquement</span>
                </label>
              </div>

              {/* Error */}
              {error && (
                <div className="mb-4 rounded-xl px-4 py-3 text-sm" style={{ background: 'rgba(251,57,54,0.06)', border: '1px solid rgba(251,57,54,0.2)', color: '#D42F2D' }}>
                  {error}
                </div>
              )}

              {/* Content */}
              {loading ? (
                <div className="flex h-48 items-center justify-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="h-8 w-8 animate-spin rounded-full border-2" style={{ borderColor: 'rgba(192,48,46,0.1)', borderTopColor: '#FB3936' }} />
                    <p className="text-sm" style={{ color: '#7F7F7F' }}>Chargement des événements…</p>
                  </div>
                </div>
              ) : events.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-3 rounded-2xl bg-white" style={{ border: '1px solid rgba(192,48,46,0.07)', padding: '3rem 2rem', textAlign: 'center' }}>
                  <div style={{ opacity: 0.3, color: '#D42F2D' }}><IconEmptyCalendar /></div>
                  {!hasActiveFilter && meta.total === 0 ? (
                    <>
                      <div>
                        <p className="text-sm font-semibold" style={{ color: '#C0302E', marginBottom: '0.25rem' }}>Aucun événement planifié.</p>
                        <p className="text-xs" style={{ color: '#7F7F7F' }}>Créez la première sortie de l&apos;association !</p>
                      </div>
                      {canManageEvents && (
                        <button onClick={() => setShowForm(true)} className="text-xs font-semibold hover:underline" style={{ color: '#FB3936' }}>
                          Créer un événement →
                        </button>
                      )}
                    </>
                  ) : (
                    <p className="text-sm font-semibold" style={{ color: '#C0302E' }}>Aucun résultat pour ce filtre.</p>
                  )}
                </div>
              ) : (
                <div className="ev-fade grid gap-4 sm:grid-cols-2 lg:grid-cols-3" style={{ animationDelay: '100ms' }}>
                  {events.map((event) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      onUpdate={handleUpdate}
                      onDelete={handleDelete}
                      onEdit={canManageEvents ? handleEdit : undefined}
                    />
                  ))}
                </div>
              )}

              {/* Pagination */}
              {meta.last_page > 1 && (
                <div className="mt-6 flex items-center justify-between">
                  <p className="text-xs" style={{ color: '#7F7F7F' }}>Page {meta.current_page} sur {meta.last_page}</p>
                  <div className="flex gap-2">
                    <button
                      disabled={meta.current_page <= 1}
                      onClick={() => setFilters((f) => ({ ...f, page: (f.page ?? 1) - 1 }))}
                      className="rounded-xl px-4 py-2 text-xs font-medium transition disabled:opacity-30"
                      style={{ border: '1px solid rgba(192,48,46,0.12)', color: '#D42F2D', background: 'white' }}
                    >
                      ← Précédent
                    </button>
                    <button
                      disabled={meta.current_page >= meta.last_page}
                      onClick={() => setFilters((f) => ({ ...f, page: (f.page ?? 1) + 1 }))}
                      className="rounded-xl px-4 py-2 text-xs font-medium transition disabled:opacity-30"
                      style={{ border: '1px solid rgba(192,48,46,0.12)', color: '#D42F2D', background: 'white' }}
                    >
                      Suivant →
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  )
}
