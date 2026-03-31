'use client'

import { useEffect, useState, useCallback } from 'react'
import type { TrainingSession, SessionType } from '@/types'
import { getSessions, getSessionTemplates, type SessionFilters } from '@/lib/sessions'
import { useRole } from '@/hooks/useRole'
import SessionCard from './SessionCard'
import SessionForm from './SessionForm'

const TYPE_OPTIONS: { value: SessionType | ''; label: string }[] = [
  { value: '',          label: 'Tous les types' },
  { value: 'running',   label: 'Course'         },
  { value: 'interval',  label: 'Interval'       },
  { value: 'fartlek',   label: 'Fartlek'        },
  { value: 'recovery',  label: 'Récupération'   },
  { value: 'strength',  label: 'Renforcement'   },
  { value: 'other',     label: 'Autre'          },
]

function IconRun({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="13" cy="4" r="1.5"/>
      <path d="M7 20l3-6 3 3 2-4 3 2"/>
      <path d="M9 10l1-3 4 1 2 3-4 1"/>
    </svg>
  )
}

function IconTemplate() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="3"/>
      <path d="M3 9h18M9 21V9"/>
    </svg>
  )
}

type Tab = 'sessions' | 'templates'

export default function SessionsPage() {
  const { canManageSessions } = useRole()

  const [tab,          setTab]          = useState<Tab>('sessions')
  const [sessions,     setSessions]     = useState<TrainingSession[]>([])
  const [templates,    setTemplates]    = useState<TrainingSession[]>([])
  const [templateType, setTemplateType] = useState<SessionType | ''>('')
  const [meta,         setMeta]         = useState({ current_page: 1, last_page: 1, total: 0, per_page: 12 })
  const [filters,      setFilters]      = useState<SessionFilters>({ page: 1 })
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState<string | null>(null)

  const [showForm,    setShowForm]    = useState(false)
  const [editSession, setEditSession] = useState<TrainingSession | undefined>()
  const [templateSrc, setTemplateSrc] = useState<TrainingSession | undefined>()

  const fetchSessions = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const res = await getSessions(filters)
      setSessions(res.data); setMeta(res.meta)
    } catch { setError('Impossible de charger les sessions.') }
    finally { setLoading(false) }
  }, [filters])

  const fetchTemplates = useCallback(async () => {
    try {
      const res = await getSessionTemplates()
      setTemplates(res.data)
    } catch { /* silencieux */ }
  }, [])

  useEffect(() => { fetchSessions() }, [fetchSessions])
  useEffect(() => { fetchTemplates() }, [fetchTemplates])

  const handleUpdate = (updated: TrainingSession) => {
    setSessions((p)  => p.map((s) => s.id === updated.id ? updated : s))
    setTemplates((p) => p.map((s) => s.id === updated.id ? updated : s))
  }
  const handleDelete = (id: number) => {
    setSessions((p)  => p.filter((s) => s.id !== id))
    setTemplates((p) => p.filter((s) => s.id !== id))
    setMeta((m) => ({ ...m, total: m.total - 1 }))
  }
  const handleEdit = (session: TrainingSession) => {
    setTemplateSrc(undefined); setEditSession(session); setShowForm(true)
  }
  const handleUseTemplate = (t: TrainingSession) => {
    setEditSession(undefined); setTemplateSrc(t); setTab('sessions'); setShowForm(true)
  }
  const handleFormSuccess = (saved: TrainingSession) => {
    if (editSession) { handleUpdate(saved) }
    else if (saved.is_template) { setTemplates((p) => [saved, ...p]) }
    else { setSessions((p) => [saved, ...p]); setMeta((m) => ({ ...m, total: m.total + 1 })) }
    if (saved.is_template) fetchTemplates()
    setShowForm(false); setEditSession(undefined); setTemplateSrc(undefined)
  }

  const filteredTemplates = templateType ? templates.filter((t) => t.type === templateType) : templates
  const displayed = tab === 'sessions' ? sessions : filteredTemplates

  const activeType = tab === 'sessions' ? (filters.type ?? '') : templateType
  const hasActiveFilter = tab === 'sessions' ? !!filters.type : !!templateType

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@400;500;600;700;800&display=swap');
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .ss-page { font-family: 'Baloo 2', sans-serif; }
        .ss-fade { animation: fadeUp 0.4s ease both; }
        .ss-tab {
          padding: 7px 18px; border-radius: 10px; font-size: 13px;
          font-weight: 600; transition: all 0.2s ease; cursor: pointer;
          border: none; background: transparent;
        }
        .ss-tab.active { background: white; color: #C0302E; box-shadow: 0 1px 4px rgba(192,48,46,0.1); }
        .ss-tab:not(.active) { color: #7F7F7F; }
        .ss-type-pill {
          padding: 5px 14px; border-radius: 20px; font-size: 12px;
          font-weight: 600; transition: all 0.2s ease; cursor: pointer;
          white-space: nowrap;
        }
        .ss-type-pill.active { background: #FB3936; color: white; box-shadow: 0 2px 8px rgba(251,57,54,0.3); border: 1px solid transparent; }
        .ss-type-pill:not(.active) { background: white; color: #7F7F7F; border: 1px solid rgba(192,48,46,0.1); }
        .ss-type-pill:not(.active):hover { background: #FAFAFA; color: #C0302E; }
      `}</style>

      <div className="ss-page min-h-screen pb-24 lg:pb-8" style={{ background: '#F8F8F8' }}>
        <div className="mx-auto max-w-5xl px-5 py-8">

          {/* ── Header ─────────────────────────────────────────────────── */}
          <div className="ss-fade mb-8 flex items-start justify-between" style={{ animationDelay: '0ms' }}>
            <div>
              <div className="mb-1 flex items-center gap-2" style={{ color: '#D42F2D' }}>
                <IconRun size={26} />
                <h1 className="text-3xl font-extrabold" style={{ letterSpacing: '-0.02em', color: '#C0302E' }}>
                  Entraînements
                </h1>
              </div>
              <p className="text-sm" style={{ color: '#7F7F7F' }}>
                Séances structurées créées par les coachs — exercices, intensités et suivi de participation.
              </p>
            </div>
            {canManageSessions && !showForm && (
              <button
                onClick={() => { setEditSession(undefined); setTemplateSrc(undefined); setShowForm(true) }}
                className="shrink-0 rounded-xl px-4 py-2.5 text-sm font-bold text-white transition"
                style={{ background: 'linear-gradient(135deg, #FB3936 0%, #D42F2D 100%)', boxShadow: '0 2px 8px rgba(251,57,54,0.3)' }}
              >
                + Nouvelle session
              </button>
            )}
          </div>

          {/* ── Form ───────────────────────────────────────────────────── */}
          {showForm && (
            <div
              className="ss-fade mb-6 overflow-hidden rounded-2xl bg-white"
              style={{ animationDelay: '40ms', boxShadow: '0 4px 20px rgba(192,48,46,0.08)', border: '1px solid rgba(192,48,46,0.08)' }}
            >
              <div className="px-6 py-4" style={{ background: 'linear-gradient(135deg, rgba(176,137,138,0.08) 0%, rgba(251,57,54,0.04) 100%)', borderBottom: '1px solid rgba(192,48,46,0.06)' }}>
                <h2 className="font-bold" style={{ color: '#C0302E' }}>
                  {editSession ? 'Modifier la session' : templateSrc ? `Depuis "${templateSrc.title}"` : 'Nouvelle session'}
                </h2>
              </div>
              <div className="p-6">
                <SessionForm
                  session={editSession}
                  templateSource={templateSrc}
                  onSuccess={handleFormSuccess}
                  onCancel={() => { setShowForm(false); setEditSession(undefined); setTemplateSrc(undefined) }}
                />
              </div>
            </div>
          )}

          {/* ── Tabs ───────────────────────────────────────────────────── */}
          <div
            className="ss-fade mb-5 flex w-fit gap-1 rounded-xl p-1"
            style={{ animationDelay: '80ms', background: 'rgba(192,48,46,0.05)' }}
          >
            <button onClick={() => setTab('sessions')} className={`ss-tab ${tab === 'sessions' ? 'active' : ''}`}>
              Sessions publiées
            </button>
            {canManageSessions && (
              <button onClick={() => setTab('templates')} className={`ss-tab ${tab === 'templates' ? 'active' : ''}`}>
                Templates
                {templates.length > 0 && (
                  <span className="ml-1.5 rounded-full px-1.5 py-0.5 text-[10px]" style={{ background: 'rgba(176,137,138,0.12)', color: '#D42F2D' }}>
                    {templates.length}
                  </span>
                )}
              </button>
            )}
          </div>

          {/* ── Type filter pills ───────────────────────────────────────── */}
          <div className="ss-fade mb-6 flex flex-wrap gap-2" style={{ animationDelay: '100ms' }}>
            {TYPE_OPTIONS.map((o) => (
              <button
                key={o.value}
                onClick={() => {
                  if (tab === 'sessions') {
                    setFilters((f) => ({ ...f, type: o.value as SessionType | '', page: 1 }))
                  } else {
                    setTemplateType(o.value as SessionType | '')
                  }
                }}
                className={`ss-type-pill ${activeType === o.value ? 'active' : ''}`}
              >
                {o.label}
              </button>
            ))}
          </div>

          {/* ── Error ──────────────────────────────────────────────────── */}
          {error && (
            <div className="mb-4 rounded-xl px-4 py-3 text-sm" style={{ background: 'rgba(251,57,54,0.06)', border: '1px solid rgba(251,57,54,0.2)', color: '#D42F2D' }}>
              {error}
            </div>
          )}

          {/* ── Content ────────────────────────────────────────────────── */}
          {loading && tab === 'sessions' ? (
            <div className="flex h-48 items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <div className="h-8 w-8 animate-spin rounded-full border-2" style={{ borderColor: 'rgba(192,48,46,0.1)', borderTopColor: '#FB3936' }} />
                <p className="text-sm" style={{ color: '#7F7F7F' }}>Chargement des sessions…</p>
              </div>
            </div>
          ) : displayed.length === 0 ? (
            <div className="ss-fade flex flex-col items-center justify-center gap-3 rounded-2xl bg-white" style={{ border: '1px solid rgba(192,48,46,0.07)', boxShadow: '0 1px 4px rgba(192,48,46,0.04)', padding: '3rem 2rem', textAlign: 'center' }}>
              <div style={{ opacity: 0.3, color: '#D42F2D' }}>
                {tab === 'templates' ? <IconTemplate /> : <IconRun size={40} />}
              </div>
              {!hasActiveFilter && (tab === 'sessions' ? meta.total === 0 : templates.length === 0) ? (
                <>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: '#C0302E', marginBottom: '0.25rem' }}>
                      {tab === 'templates' ? 'Aucun template sauvegardé.' : 'Aucune session publiée.'}
                    </p>
                    <p className="text-xs" style={{ color: '#7F7F7F' }}>
                      {tab === 'templates'
                        ? 'Créez une session et sauvegardez-la comme template pour la réutiliser.'
                        : 'Soyez le premier à partager une séance d\'entraînement !'}
                    </p>
                  </div>
                  {canManageSessions && (
                    <button
                      onClick={() => setShowForm(true)}
                      className="text-xs font-semibold hover:underline"
                      style={{ color: '#FB3936' }}
                    >
                      {tab === 'templates' ? 'Créer un template →' : 'Publier une session →'}
                    </button>
                  )}
                </>
              ) : (
                <p className="text-sm font-semibold" style={{ color: '#C0302E' }}>Aucun résultat pour ce filtre.</p>
              )}
            </div>
          ) : (
            <div className="ss-fade grid gap-4 sm:grid-cols-2 lg:grid-cols-3" style={{ animationDelay: '120ms' }}>
              {displayed.map((session) =>
                tab === 'templates' ? (
                  <div
                    key={session.id}
                    className="flex flex-col overflow-hidden rounded-2xl bg-white"
                    style={{ boxShadow: '0 2px 8px rgba(192,48,46,0.07)', border: '1px solid rgba(192,48,46,0.07)' }}
                  >
                    <SessionCard
                      session={session}
                      onUpdate={handleUpdate}
                      onDelete={handleDelete}
                      onEdit={canManageSessions ? handleEdit : undefined}
                    />
                    <div className="mt-auto px-4 pb-4">
                      <button
                        onClick={() => handleUseTemplate(session)}
                        className="w-full rounded-xl py-2 text-xs font-bold transition"
                        style={{ background: 'rgba(169,50,38,0.08)', color: '#D42F2D', border: '1px solid rgba(169,50,38,0.15)' }}
                      >
                        ↗ Utiliser ce template
                      </button>
                    </div>
                  </div>
                ) : (
                  <SessionCard
                    key={session.id}
                    session={session}
                    onUpdate={handleUpdate}
                    onDelete={handleDelete}
                    onEdit={canManageSessions ? handleEdit : undefined}
                  />
                )
              )}
            </div>
          )}

          {/* ── Pagination ─────────────────────────────────────────────── */}
          {tab === 'sessions' && meta.last_page > 1 && (
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

        </div>
      </div>
    </>
  )
}
