'use client'

import { useRole } from '@/hooks/useRole'
import { getSessions, getSessionTemplates, type SessionFilters } from '@/lib/sessions'
import type { SessionType, TrainingSession } from '@/types'
import { useCallback, useEffect, useState } from 'react'
import { Activity, ArrowUpRight, ChevronLeft, ChevronRight, LayoutTemplate, Plus } from 'lucide-react'
import SessionCard from './SessionCard'
import SessionForm from './SessionForm'

const TYPE_OPTIONS: { value: SessionType | ''; label: string }[] = [
  { value: '', label: 'Tous les types' },
  { value: 'running', label: 'Course' },
  { value: 'interval', label: 'Interval' },
  { value: 'fartlek', label: 'Fartlek' },
  { value: 'recovery', label: 'Récupération' },
  { value: 'strength', label: 'Renforcement' },
  { value: 'other', label: 'Autre' },
]

type Tab = 'sessions' | 'templates'

export default function SessionsPage() {
  const { canManageSessions } = useRole()

  const [tab, setTab] = useState<Tab>('sessions')
  const [sessions, setSessions] = useState<TrainingSession[]>([])
  const [templates, setTemplates] = useState<TrainingSession[]>([])
  const [templateType, setTemplateType] = useState<SessionType | ''>('')
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0, per_page: 12 })
  const [filters, setFilters] = useState<SessionFilters>({ page: 1 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [showForm, setShowForm] = useState(false)
  const [editSession, setEditSession] = useState<TrainingSession | undefined>()
  const [templateSrc, setTemplateSrc] = useState<TrainingSession | undefined>()

  const fetchSessions = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await getSessions(filters)
      setSessions(res.data)
      setMeta(res.meta)
    } catch {
      setError('Impossible de charger les sessions.')
    } finally {
      setLoading(false)
    }
  }, [filters])

  const fetchTemplates = useCallback(async () => {
    try {
      const res = await getSessionTemplates()
      setTemplates(res.data)
    } catch {
      console.error('Impossible de charger les templates de session.')
    }
  }, [])

  useEffect(() => {
    fetchSessions()
  }, [fetchSessions])
  useEffect(() => {
    fetchTemplates()
  }, [fetchTemplates])

  const handleUpdate = (updated: TrainingSession) => {
    setSessions((p) => p.map((s) => (s.id === updated.id ? updated : s)))
    setTemplates((p) => p.map((s) => (s.id === updated.id ? updated : s)))
  }
  const handleDelete = (id: number) => {
    setSessions((p) => p.filter((s) => s.id !== id))
    setTemplates((p) => p.filter((s) => s.id !== id))
    setMeta((m) => ({ ...m, total: m.total - 1 }))
  }
  const handleEdit = (session: TrainingSession) => {
    setTemplateSrc(undefined)
    setEditSession(session)
    setShowForm(true)
  }
  const handleUseTemplate = (t: TrainingSession) => {
    setEditSession(undefined)
    setTemplateSrc(t)
    setTab('sessions')
    setShowForm(true)
  }
  const handleFormSuccess = (saved: TrainingSession) => {
    if (editSession) {
      handleUpdate(saved)
    } else if (saved.is_template) {
      setTemplates((p) => [saved, ...p])
    } else {
      setSessions((p) => [saved, ...p])
      setMeta((m) => ({ ...m, total: m.total + 1 }))
    }
    if (saved.is_template) fetchTemplates()
    setShowForm(false)
    setEditSession(undefined)
    setTemplateSrc(undefined)
  }

  const filteredTemplates = templateType
    ? templates.filter((t) => t.type === templateType)
    : templates
  const displayed = tab === 'sessions' ? sessions : filteredTemplates

  const activeType = tab === 'sessions' ? (filters.type ?? '') : templateType
  const hasActiveFilter = tab === 'sessions' ? !!filters.type : !!templateType

  return (
    <div className="ss-page min-h-screen pb-24 bg-sf-cream-soft lg:pb-8">
      <div className="mx-auto max-w-5xl px-5 py-8">

        {/* ── Header ─────────────────────────────────────────────────── */}
        <div className="ss-fade mb-8 flex items-start justify-between">
          <div>
            <div className="mb-1 flex items-center gap-2 text-sf-terra-dark">
              <Activity size={26} />
              <h1 className="text-3xl font-extrabold tracking-[-0.02em] text-sf-bark-red">
                Entraînements
              </h1>
            </div>
            <p className="text-sm text-sf-muted">
              {meta.total} session{meta.total > 1 ? 's' : ''} d&apos;entraînement planifiée
              {meta.total > 1 ? 's' : ''}
            </p>
          </div>
          {canManageSessions && !showForm && (
            <button
              onClick={() => {
                setEditSession(undefined)
                setTemplateSrc(undefined)
                setShowForm(true)
              }}
              className="flex shrink-0 items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-bold text-white transition"
              style={{
                background: 'linear-gradient(135deg, #FB3936 0%, #D42F2D 100%)',
                boxShadow: '0 2px 8px rgba(251,57,54,0.3)',
              }}
            >
              <Plus size={15} /> Nouvelle session
            </button>
          )}
        </div>

        {/* ── Form ───────────────────────────────────────────────────── */}
        {showForm && (
          <div
            className="ss-fade [animation-delay:40ms] mb-6 overflow-hidden rounded-2xl bg-white"
            style={{
              boxShadow: '0 4px 20px rgba(192,48,46,0.08)',
              border: '1px solid rgba(192,48,46,0.08)',
            }}
          >
            <div
              className="px-6 py-4"
              style={{
                background:
                  'linear-gradient(135deg, rgba(176,137,138,0.08) 0%, rgba(251,57,54,0.04) 100%)',
                borderBottom: '1px solid rgba(192,48,46,0.06)',
              }}
            >
              <h2 className="font-bold text-sf-bark-red">
                {editSession
                  ? 'Modifier la session'
                  : templateSrc
                    ? `Depuis "${templateSrc.title}"`
                    : 'Nouvelle session'}
              </h2>
            </div>
            <div className="p-6">
              <SessionForm
                session={editSession}
                templateSource={templateSrc}
                onSuccess={handleFormSuccess}
                onCancel={() => {
                  setShowForm(false)
                  setEditSession(undefined)
                  setTemplateSrc(undefined)
                }}
              />
            </div>
          </div>
        )}

        {/* ── Tabs ───────────────────────────────────────────────────── */}
        <div
          className="ss-fade [animation-delay:80ms] mb-5 flex w-fit gap-1 rounded-xl p-1 bg-[rgba(192,48,46,0.05)]"
        >
          <button
            onClick={() => setTab('sessions')}
            data-active={tab === 'sessions'}
            className="px-[18px] py-[7px] rounded-[10px] text-[13px] font-semibold transition-all cursor-pointer
                       data-[active=true]:bg-white data-[active=true]:text-sf-bark-red data-[active=true]:shadow-sm
                       data-[active=false]:text-sf-muted"
          >
            Sessions publiées
          </button>
          {canManageSessions && (
            <button
              onClick={() => setTab('templates')}
              data-active={tab === 'templates'}
              className="px-[18px] py-[7px] rounded-[10px] text-[13px] font-semibold transition-all cursor-pointer
                         data-[active=true]:bg-white data-[active=true]:text-sf-bark-red data-[active=true]:shadow-sm
                         data-[active=false]:text-sf-muted"
            >
              Templates
              {templates.length > 0 && (
                <span
                  className="ml-1.5 rounded-full px-1.5 py-0.5 text-[10px]"
                  style={{ background: 'rgba(176,137,138,0.12)', color: '#D42F2D' }}
                >
                  {templates.length}
                </span>
              )}
            </button>
          )}
        </div>

        {/* ── Type filter pills ───────────────────────────────────────── */}
        <div className="ss-fade [animation-delay:100ms] mb-6 flex flex-wrap gap-2">
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
              data-active={activeType === o.value}
              className="px-[14px] py-[5px] rounded-[20px] text-xs font-semibold transition-all whitespace-nowrap
                         data-[active=true]:bg-sf-terra data-[active=true]:text-white data-[active=true]:shadow-[0_2px_8px_rgba(251,57,54,0.3)] data-[active=true]:border-transparent
                         data-[active=false]:bg-white data-[active=false]:text-sf-muted data-[active=false]:border data-[active=false]:border-[rgba(192,48,46,0.1)]
                         hover:data-[active=false]:bg-sf-cream hover:data-[active=false]:text-sf-bark-red"
            >
              {o.label}
            </button>
          ))}
        </div>

        {/* ── Error ──────────────────────────────────────────────────── */}
        {error && (
          <div
            className="mb-4 rounded-xl px-4 py-3 text-sm"
            style={{
              background: 'rgba(251,57,54,0.06)',
              border: '1px solid rgba(251,57,54,0.2)',
              color: '#D42F2D',
            }}
          >
            {error}
          </div>
        )}

        {/* ── Content ────────────────────────────────────────────────── */}
        {loading && tab === 'sessions' ? (
          <div className="flex h-48 items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div
                className="h-8 w-8 animate-spin rounded-full border-2"
                style={{ borderColor: 'rgba(192,48,46,0.1)', borderTopColor: '#FB3936' }}
              />
              <p className="text-sm text-sf-muted">Chargement des sessions…</p>
            </div>
          </div>
        ) : displayed.length === 0 ? (
          <div
            className="ss-fade flex flex-col items-center justify-center gap-3 rounded-2xl bg-white px-8 py-12 text-center"
            style={{
              border: '1px solid rgba(192,48,46,0.07)',
              boxShadow: '0 1px 4px rgba(192,48,46,0.04)',
            }}
          >
            <div className="opacity-30 text-sf-terra-dark">
              {tab === 'templates' ? <LayoutTemplate size={40} /> : <Activity size={40} />}
            </div>
            {!hasActiveFilter &&
            (tab === 'sessions' ? meta.total === 0 : templates.length === 0) ? (
              <>
                <div>
                  <p className="mb-1 text-sm font-semibold text-sf-bark-red">
                    {tab === 'templates'
                      ? 'Aucun template sauvegardé.'
                      : 'Aucune session publiée.'}
                  </p>
                  <p className="text-xs text-sf-muted">
                    {tab === 'templates'
                      ? 'Créez une session et sauvegardez-la comme template pour la réutiliser.'
                      : "Soyez le premier à partager une séance d'entraînement !"}
                  </p>
                </div>
                {canManageSessions && (
                  <button
                    onClick={() => setShowForm(true)}
                    className="text-xs font-semibold text-sf-terra hover:underline"
                  >
                    {tab === 'templates' ? 'Créer un template →' : 'Publier une session →'}
                  </button>
                )}
              </>
            ) : (
              <p className="text-sm font-semibold text-sf-bark-red">
                Aucun résultat pour ce filtre.
              </p>
            )}
          </div>
        ) : (
          <div className="ss-fade [animation-delay:120ms] grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {displayed.map((session) =>
              tab === 'templates' ? (
                <div
                  key={session.id}
                  className="flex flex-col overflow-hidden rounded-2xl bg-white"
                  style={{
                    boxShadow: '0 2px 8px rgba(192,48,46,0.07)',
                    border: '1px solid rgba(192,48,46,0.07)',
                  }}
                >
                  <SessionCard
                    session={session}
                    onUpdate={handleUpdate}
                    onDelete={handleDelete}
                    isTemplate
                  />
                  <div className="mt-auto px-4 pb-4">
                    <button
                      onClick={() => handleUseTemplate(session)}
                      className="flex w-full items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold transition"
                      style={{
                        background: 'rgba(169,50,38,0.08)',
                        color: '#D42F2D',
                        border: '1px solid rgba(169,50,38,0.15)',
                      }}
                    >
                      <ArrowUpRight size={13} /> Utiliser ce template
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
            <p className="text-xs text-sf-muted">
              Page {meta.current_page} sur {meta.last_page}
            </p>
            <div className="flex gap-2">
              <button
                disabled={meta.current_page <= 1}
                onClick={() => setFilters((f) => ({ ...f, page: (f.page ?? 1) - 1 }))}
                className="flex items-center gap-1 rounded-xl px-4 py-2 text-xs font-medium transition disabled:opacity-30"
                style={{
                  border: '1px solid rgba(192,48,46,0.12)',
                  color: '#D42F2D',
                  background: 'white',
                }}
              >
                <ChevronLeft size={13} /> Précédent
              </button>
              <button
                disabled={meta.current_page >= meta.last_page}
                onClick={() => setFilters((f) => ({ ...f, page: (f.page ?? 1) + 1 }))}
                className="flex items-center gap-1 rounded-xl px-4 py-2 text-xs font-medium transition disabled:opacity-30"
                style={{
                  border: '1px solid rgba(192,48,46,0.12)',
                  color: '#D42F2D',
                  background: 'white',
                }}
              >
                Suivant <ChevronRight size={13} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
