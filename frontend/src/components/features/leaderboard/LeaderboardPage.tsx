'use client'

import { useToast } from '@/components/ui/Toast'
import {
  addPerformance,
  deletePerformance,
  getLeaderboard,
  getUserPerformances,
  type LeaderboardPeriod,
  type UserPerformancesMeta,
} from '@/lib/performances'
import { useAuthStore } from '@/store/auth.store'
import type { LeaderboardEntry, Performance } from '@/types'
import { useCallback, useEffect, useState } from 'react'

// ── Helpers ────────────────────────────────────────────────────────────────────

function formatDuration(sec: number): string {
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  const s = sec % 60
  if (h > 0) return `${h}h${String(m).padStart(2, '0')}`
  return `${m}:${String(s).padStart(2, '0')}`
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

// ── SVG Icons ──────────────────────────────────────────────────────────────────

function IconTrophy() {
  return (
    <svg
      width={26}
      height={26}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 9H4a2 2 0 0 1-2-2V5h4M18 9h2a2 2 0 0 0 2-2V5h-4" />
      <path d="M12 17c-3.87 0-7-3.13-7-7V5h14v5c0 3.87-3.13 7-7 7z" />
      <path d="M12 17v4M8 21h8" />
    </svg>
  )
}

function IconRoute() {
  return (
    <svg
      width={22}
      height={22}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 17c3-3 6-3 9 0s6 3 9 0" />
      <path d="M3 7c3-3 6-3 9 0s6 3 9 0" />
    </svg>
  )
}

function IconRun() {
  return (
    <svg
      width={22}
      height={22}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="13" cy="4" r="1.5" />
      <path d="M7 20l3-6 3 3 2-4 3 2" />
      <path d="M9 10l1-3 4 1 2 3-4 1" />
    </svg>
  )
}

function IconAvg() {
  return (
    <svg
      width={22}
      height={22}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 20V10M12 20V4M6 20v-6" />
    </svg>
  )
}

function IconEmptyFlag() {
  return (
    <svg
      width={48}
      height={48}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
      <line x1="4" y1="22" x2="4" y2="15" />
    </svg>
  )
}

function IconTrash() {
  return (
    <svg
      width={15}
      height={15}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  )
}

// ── PerformanceForm ────────────────────────────────────────────────────────────

function PerformanceForm({ onAdded }: { onAdded: (p: Performance) => void }) {
  const { toast } = useToast()
  const [distanceKm, setDistanceKm] = useState('')
  const [durationH, setDurationH] = useState('')
  const [durationMin, setDurationMin] = useState('')
  const [durationSec, setDurationSec] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const km = parseFloat(distanceKm)
    if (isNaN(km) || km <= 0) {
      toast('Distance invalide.', 'error')
      return
    }
    const totalSec =
      parseInt(durationH || '0') * 3600 +
      parseInt(durationMin || '0') * 60 +
      parseInt(durationSec || '0')
    if (totalSec <= 0) {
      toast('Durée invalide.', 'error')
      return
    }
    setLoading(true)
    try {
      const perf = await addPerformance({ distance_km: km, duration_sec: totalSec, date })
      onAdded(perf)
      setDistanceKm('')
      setDurationH('')
      setDurationMin('')
      setDurationSec('')
      setDate(new Date().toISOString().slice(0, 10))
      toast('Performance enregistrée !', 'success')
    } catch {
      toast("Erreur lors de l'enregistrement.", 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="overflow-hidden rounded-2xl bg-white"
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
        <h3 className="font-bold" style={{ fontFamily: "'Baloo 2', sans-serif", color: '#C0302E' }}>
          + Saisir une performance
        </h3>
        <p className="mt-0.5 text-xs" style={{ color: '#7F7F7F' }}>
          Ajoutez votre sortie au classement de l&apos;association
        </p>
      </div>
      <div className="grid gap-4 p-6 sm:grid-cols-2">
        <div>
          <label
            className="mb-1.5 block text-xs font-semibold tracking-wider uppercase"
            style={{ color: '#7F7F7F' }}
          >
            Distance (km)
          </label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            value={distanceKm}
            onChange={(e) => setDistanceKm(e.target.value)}
            required
            placeholder="10.5"
            className="w-full rounded-xl px-4 py-2.5 text-sm transition outline-none"
            style={{ border: '1px solid rgba(192,48,46,0.15)', color: '#C0302E' }}
          />
        </div>
        <div>
          <label
            className="mb-1.5 block text-xs font-semibold tracking-wider uppercase"
            style={{ color: '#7F7F7F' }}
          >
            Date
          </label>
          <input
            type="date"
            value={date}
            max={new Date().toISOString().slice(0, 10)}
            onChange={(e) => setDate(e.target.value)}
            required
            className="w-full rounded-xl px-4 py-2.5 text-sm transition outline-none"
            style={{ border: '1px solid rgba(192,48,46,0.15)', color: '#C0302E' }}
          />
        </div>
        <div className="sm:col-span-2">
          <label
            className="mb-1.5 block text-xs font-semibold tracking-wider uppercase"
            style={{ color: '#7F7F7F' }}
          >
            Durée
          </label>
          <div className="flex items-center gap-2">
            {[
              { val: durationH, set: setDurationH, ph: '0', max: 23, unit: 'h' },
              { val: durationMin, set: setDurationMin, ph: '45', max: 59, unit: 'min' },
              { val: durationSec, set: setDurationSec, ph: '00', max: 59, unit: 'sec' },
            ].map(({ val, set, ph, max, unit }) => (
              <div key={unit} className="flex items-center gap-1.5">
                <input
                  type="number"
                  min="0"
                  max={max}
                  placeholder={ph}
                  value={val}
                  onChange={(e) => set(e.target.value)}
                  className="w-14 rounded-xl px-2 py-2.5 text-center text-sm transition outline-none"
                  style={{ border: '1px solid rgba(192,48,46,0.15)', color: '#C0302E' }}
                />
                <span className="text-xs font-medium" style={{ color: '#7F7F7F' }}>
                  {unit}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex justify-end px-6 pb-5">
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl px-6 py-2.5 text-sm font-bold text-white transition disabled:opacity-50"
          style={{
            background: 'linear-gradient(135deg, #FB3936 0%, #D42F2D 100%)',
            boxShadow: '0 2px 8px rgba(251,57,54,0.3)',
          }}
        >
          {loading ? 'Enregistrement…' : 'Enregistrer'}
        </button>
      </div>
    </form>
  )
}

// ── Podium ─────────────────────────────────────────────────────────────────────

function Podium({ entries }: { entries: LeaderboardEntry[] }) {
  const top3 = entries.slice(0, 3)
  if (top3.length < 1) return null

  const ORDER = [1, 0, 2]
  const HEIGHTS = ['h-20', 'h-28', 'h-16']
  const RANKS = ['2', '1', '3']
  const COLORS = [
    { bg: 'rgba(148,163,184,0.15)', border: '#94a3b8', text: '#64748b' },
    { bg: 'rgba(251,57,54,0.12)', border: '#FB3936', text: '#FB3936' },
    { bg: 'rgba(180,110,50,0.12)', border: '#b46c32', text: '#9a5a1e' },
  ]

  return (
    <div className="mb-6 flex items-end justify-center gap-3">
      {ORDER.map((realIdx, displayIdx) => {
        const entry = top3[realIdx]
        if (!entry) return <div key={displayIdx} className="w-24" />
        const cfg = COLORS[displayIdx]
        return (
          <div key={entry.user.id} className="flex flex-col items-center gap-1.5">
            <span
              className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold"
              style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.text }}
            >
              #{RANKS[displayIdx]}
            </span>
            <div
              className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold"
              style={{ background: cfg.bg, border: `2px solid ${cfg.border}`, color: cfg.text }}
            >
              {entry.user.name.charAt(0).toUpperCase()}
            </div>
            <p
              className="max-w-20 truncate text-center text-xs font-bold"
              style={{ color: '#C0302E' }}
            >
              {entry.user.name.split(' ')[0]}
            </p>
            <p className="text-xs font-semibold" style={{ color: cfg.text }}>
              {entry.total_distance_km.toFixed(1)} km
            </p>
            <div
              className={`w-20 rounded-t-lg ${HEIGHTS[displayIdx]} flex items-end justify-center pb-2`}
              style={{ background: cfg.bg, border: `1px solid ${cfg.border}20` }}
            >
              <span className="text-xs font-bold" style={{ color: cfg.text }}>
                #{entry.rank}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── Main Page ──────────────────────────────────────────────────────────────────

const PERIOD_LABELS: Record = {
  week: 'Cette semaine',
  month: 'Ce mois',
  season: 'Cette saison',
}

export default function LeaderboardPage() {
  const user = useAuthStore((s) => s.user)
  const { toast } = useToast()

  const [period, setPeriod] = useState<LeaderboardPeriod>('month')
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [lbLoading, setLbLoading] = useState(true)

  const [performances, setPerformances] = useState<Performance[]>([])
  const [perfMeta, setPerfMeta] = useState<UserPerformancesMeta | null>(null)
  const [perfPage, setPerfPage] = useState(1)
  const [perfLoading, setPerfLoading] = useState(true)

  const [isDisabled] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [tab, setTab] = useState<'leaderboard' | 'my-perfs'>('leaderboard')
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const fetchLeaderboard = useCallback(async () => {
    setLbLoading(true)
    try {
      const res = await getLeaderboard(period)
      setEntries(res.data)
    } catch {
      /* silencieux */
    } finally {
      setLbLoading(false)
    }
  }, [period])

  const fetchMyPerfs = useCallback(async () => {
    if (!user) return
    setPerfLoading(true)
    try {
      const res = await getUserPerformances(user.id, perfPage)
      setPerformances(res.data)
      setPerfMeta(res.meta)
    } catch {
      /* silencieux */
    } finally {
      setPerfLoading(false)
    }
  }, [user, perfPage])

  useEffect(() => {
    fetchLeaderboard()
  }, [fetchLeaderboard])
  useEffect(() => {
    fetchMyPerfs()
  }, [fetchMyPerfs])

  const handlePerfAdded = (perf: Performance) => {
    setPerformances((prev) => [perf, ...prev])
    setPerfMeta((m) =>
      m
        ? {
            ...m,
            total: m.total + 1,
            total_sessions: m.total_sessions + 1,
            total_distance: m.total_distance + perf.distance_km,
          }
        : m
    )
    setShowForm(false)
    setTab('my-perfs')
  }

  const handleDelete = async (perf: Performance) => {
    try {
      await deletePerformance(perf.id)
      setPerformances((prev) => prev.filter((p) => p.id !== perf.id))
      setPerfMeta((m) =>
        m
          ? {
              ...m,
              total: m.total - 1,
              total_sessions: m.total_sessions - 1,
              total_distance: m.total_distance - perf.distance_km,
            }
          : m
      )
      fetchLeaderboard()
      toast('Performance supprimée.', 'success')
    } catch {
      toast('Erreur lors de la suppression.', 'error')
    } finally {
      setDeletingId(null)
    }
  }

  const myRank = user ? entries.find((e) => e.user.id === user.id) : null

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@400;500;600;700;800&display=swap');
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .lb-page { font-family: 'Baloo 2', sans-serif; }
        .lb-fade { animation: fadeUp 0.4s ease both; }
        .lb-row { transition: background 0.15s ease; }
        .lb-row:hover { background: rgba(192,48,46,0.02); }
        .lb-btn-period {
          padding: 6px 16px; border-radius: 20px; font-size: 12px;
          font-weight: 600; transition: all 0.2s ease; cursor: pointer; border: none;
        }
        .lb-btn-period.active { background: #FB3936; color: white; box-shadow: 0 2px 8px rgba(251,57,54,0.3); }
        .lb-btn-period:not(.active) { background: white; color: #7F7F7F; border: 1px solid rgba(192,48,46,0.12); }
        .lb-btn-period:not(.active):hover { background: #FAFAFA; color: #C0302E; }
        .lb-tab {
          padding: 8px 20px; border-radius: 10px; font-size: 13px;
          font-weight: 600; transition: all 0.2s ease; cursor: pointer; border: none; background: transparent;
        }
        .lb-tab.active { background: white; color: #C0302E; box-shadow: 0 1px 4px rgba(192,48,46,0.1); }
        .lb-tab:not(.active) { color: #7F7F7F; }
        .lb-stat-card {
          background: white; border-radius: 16px; padding: 20px; text-align: center;
          border: 1px solid rgba(192,48,46,0.07); box-shadow: 0 1px 4px rgba(192,48,46,0.05);
        }
        .lb-trash { color: rgba(192,48,46,0.3); background: transparent; }
        .lb-trash:hover { color: #FB3936; background: rgba(251,57,54,0.06); }
      `}</style>

      <div className="lb-page min-h-screen pb-24 lg:pb-8" style={{ background: '#F8F8F8' }}>
        <div className="mx-auto max-w-4xl px-5 py-8">
          {/* ── Disabled state ──────────────────────────────────────────── */}
          {isDisabled && (
            <div
              className="flex flex-col items-center justify-center gap-4 rounded-2xl bg-white py-20 text-center"
              style={{
                border: '1px solid rgba(192,48,46,0.08)',
                boxShadow: '0 2px 8px rgba(192,48,46,0.04)',
              }}
            >
              <div style={{ opacity: 0.3, color: '#C0302E' }}>
                <IconTrophy />
              </div>
              <p className="text-lg font-bold" style={{ color: '#1A1A1A' }}>
                Classement désactivé
              </p>
              <p className="text-sm" style={{ color: '#7F7F7F' }}>
                Fonctionnalité désactivée par l&apos;administrateur.
              </p>
            </div>
          )}

          {!isDisabled && (
            <>
              {/* ── Header ─────────────────────────────────────────────────── */}
              <div
                className="lb-fade mb-8 flex items-start justify-between"
                style={{ animationDelay: '0ms' }}
              >
                <div>
                  <div className="mb-1 flex items-center gap-2" style={{ color: '#D42F2D' }}>
                    <IconTrophy />
                    <h1
                      className="text-3xl font-extrabold"
                      style={{ letterSpacing: '-0.02em', color: '#C0302E' }}
                    >
                      Classement
                    </h1>
                  </div>
                  <p className="text-sm" style={{ color: '#7F7F7F' }}>
                    Distance totale parcourue par les membres de l&apos;association
                  </p>
                </div>
                <button
                  onClick={() => setShowForm((v) => !v)}
                  className="shrink-0 rounded-xl px-4 py-2.5 text-sm font-bold text-white transition"
                  style={{
                    background: showForm
                      ? '#7F7F7F'
                      : 'linear-gradient(135deg, #FB3936 0%, #D42F2D 100%)',
                    boxShadow: showForm ? 'none' : '0 2px 8px rgba(251,57,54,0.3)',
                  }}
                >
                  {showForm ? '✕ Annuler' : '+ Ma performance'}
                </button>
              </div>

              {/* ── Form ───────────────────────────────────────────────────── */}
              {showForm && user && (
                <div className="lb-fade mb-6" style={{ animationDelay: '50ms' }}>
                  <PerformanceForm onAdded={handlePerfAdded} />
                </div>
              )}

              {/* ── My rank banner ──────────────────────────────────────────── */}
              {myRank && (
                <div
                  className="lb-fade mb-6 flex items-center gap-4 rounded-2xl px-5 py-4"
                  style={{
                    animationDelay: '80ms',
                    background:
                      'linear-gradient(135deg, rgba(251,57,54,0.08) 0%, rgba(146,43,33,0.04) 100%)',
                    border: '1px solid rgba(251,57,54,0.2)',
                  }}
                >
                  <div
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-xl font-extrabold"
                    style={{ background: 'rgba(251,57,54,0.12)', color: '#FB3936' }}
                  >
                    #{myRank.rank}
                  </div>
                  <div>
                    <p className="font-bold" style={{ color: '#C0302E' }}>
                      Votre position — {PERIOD_LABELS[period]}
                    </p>
                    <p className="text-sm" style={{ color: '#7F7F7F' }}>
                      <span className="font-semibold" style={{ color: '#D42F2D' }}>
                        {myRank.total_distance_km.toFixed(2)} km
                      </span>
                      {' · '}
                      {myRank.total_sessions} sortie{myRank.total_sessions > 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="ml-auto text-right">
                    <p className="text-xs" style={{ color: '#7F7F7F' }}>
                      sur {entries.length} coureur{entries.length > 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              )}

              {/* ── Tabs ───────────────────────────────────────────────────── */}
              <div
                className="lb-fade mb-6 flex w-fit gap-1 rounded-xl p-1"
                style={{ animationDelay: '100ms', background: 'rgba(192,48,46,0.05)' }}
              >
                <button
                  onClick={() => setTab('leaderboard')}
                  className={`lb-tab ${tab === 'leaderboard' ? 'active' : ''}`}
                >
                  Classement
                </button>
                <button
                  onClick={() => setTab('my-perfs')}
                  className={`lb-tab ${tab === 'my-perfs' ? 'active' : ''}`}
                >
                  Mes performances
                  {perfMeta && (
                    <span
                      className="ml-1.5 rounded-full px-1.5 py-0.5 text-[10px]"
                      style={{ background: 'rgba(176,137,138,0.12)', color: '#D42F2D' }}
                    >
                      {perfMeta.total}
                    </span>
                  )}
                </button>
              </div>

              {/* ── LEADERBOARD TAB ────────────────────────────────────────── */}
              {tab === 'leaderboard' && (
                <div className="lb-fade space-y-5" style={{ animationDelay: '140ms' }}>
                  {/* Period filter */}
                  <div className="flex gap-2">
                    {(Object.keys(PERIOD_LABELS) as LeaderboardPeriod[]).map((p) => (
                      <button
                        key={p}
                        onClick={() => setPeriod(p)}
                        className={`lb-btn-period ${period === p ? 'active' : ''}`}
                      >
                        {PERIOD_LABELS[p]}
                      </button>
                    ))}
                  </div>

                  {lbLoading ? (
                    <div className="flex h-48 items-center justify-center">
                      <div className="flex flex-col items-center gap-3">
                        <div
                          className="h-8 w-8 animate-spin rounded-full border-2"
                          style={{ borderColor: 'rgba(192,48,46,0.1)', borderTopColor: '#FB3936' }}
                        />
                        <p className="text-sm" style={{ color: '#7F7F7F' }}>
                          Chargement du classement…
                        </p>
                      </div>
                    </div>
                  ) : entries.length === 0 ? (
                    <div
                      className="flex h-48 flex-col items-center justify-center gap-3 rounded-2xl bg-white"
                      style={{ border: '1px solid rgba(192,48,46,0.07)' }}
                    >
                      <div style={{ opacity: 0.3, color: '#D42F2D' }}>
                        <IconEmptyFlag />
                      </div>
                      <p className="text-sm" style={{ color: '#7F7F7F' }}>
                        Aucune performance pour cette période.
                      </p>
                    </div>
                  ) : (
                    <>
                      {entries.length >= 3 && <Podium entries={entries} />}

                      <div style={{ overflowX: 'auto' }}>
                        <div
                          className="overflow-hidden rounded-2xl bg-white"
                          style={{
                            boxShadow: '0 2px 12px rgba(192,48,46,0.07)',
                            border: '1px solid rgba(192,48,46,0.07)',
                            minWidth: '360px',
                          }}
                        >
                          <div
                            className="grid grid-cols-12 border-b px-5 py-3"
                            style={{ borderColor: 'rgba(192,48,46,0.06)', background: '#F8F8F8' }}
                          >
                            <div
                              className="col-span-1 text-[11px] font-bold tracking-wider uppercase"
                              style={{ color: '#7F7F7F' }}
                            >
                              #
                            </div>
                            <div
                              className="col-span-6 text-[11px] font-bold tracking-wider uppercase"
                              style={{ color: '#7F7F7F' }}
                            >
                              Coureur
                            </div>
                            <div
                              className="col-span-3 text-right text-[11px] font-bold tracking-wider uppercase"
                              style={{ color: '#7F7F7F' }}
                            >
                              Distance
                            </div>
                            <div
                              className="col-span-2 hidden text-right text-[11px] font-bold tracking-wider uppercase sm:block"
                              style={{ color: '#7F7F7F' }}
                            >
                              Sorties
                            </div>
                          </div>
                          {entries.map((entry, i) => {
                            const isMe = user?.id === entry.user.id
                            return (
                              <div
                                key={entry.user.id}
                                className="lb-row grid grid-cols-12 items-center px-5 py-3.5"
                                style={{
                                  borderBottom:
                                    i < entries.length - 1
                                      ? '1px solid rgba(192,48,46,0.04)'
                                      : 'none',
                                  background: isMe ? 'rgba(251,57,54,0.04)' : 'transparent',
                                }}
                              >
                                <div className="col-span-1">
                                  {entry.rank <= 3 ? (
                                    <span
                                      className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold"
                                      style={{
                                        background:
                                          entry.rank === 1
                                            ? 'rgba(251,57,54,0.15)'
                                            : entry.rank === 2
                                              ? 'rgba(148,163,184,0.2)'
                                              : 'rgba(180,110,50,0.15)',
                                        color:
                                          entry.rank === 1
                                            ? '#FB3936'
                                            : entry.rank === 2
                                              ? '#64748b'
                                              : '#9a5a1e',
                                        border: `1px solid ${entry.rank === 1 ? 'rgba(251,57,54,0.3)' : entry.rank === 2 ? '#94a3b8' : 'rgba(180,110,50,0.3)'}`,
                                      }}
                                    >
                                      {entry.rank}
                                    </span>
                                  ) : (
                                    <span
                                      className="text-sm font-bold"
                                      style={{ color: 'rgba(192,48,46,0.2)' }}
                                    >
                                      {entry.rank}
                                    </span>
                                  )}
                                </div>
                                <div className="col-span-6 flex items-center gap-2.5">
                                  <div
                                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                                    style={{
                                      background: isMe
                                        ? 'rgba(251,57,54,0.12)'
                                        : 'rgba(192,48,46,0.06)',
                                      color: isMe ? '#FB3936' : '#7F7F7F',
                                    }}
                                  >
                                    {entry.user.name.charAt(0).toUpperCase()}
                                  </div>
                                  <span
                                    className="text-sm font-semibold"
                                    style={{ color: isMe ? '#FB3936' : '#C0302E' }}
                                  >
                                    {entry.user.name}
                                    {isMe && (
                                      <span
                                        className="ml-1 text-[10px] font-normal"
                                        style={{ color: '#7F7F7F' }}
                                      >
                                        (vous)
                                      </span>
                                    )}
                                  </span>
                                </div>
                                <div className="col-span-3 text-right">
                                  <span className="text-sm font-bold" style={{ color: '#C0302E' }}>
                                    {entry.total_distance_km.toFixed(2)}
                                  </span>
                                  <span className="ml-1 text-xs" style={{ color: '#7F7F7F' }}>
                                    km
                                  </span>
                                </div>
                                <div
                                  className="col-span-2 hidden text-right text-sm sm:block"
                                  style={{ color: '#7F7F7F' }}
                                >
                                  {entry.total_sessions}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* ── MY PERFORMANCES TAB ────────────────────────────────────── */}
              {tab === 'my-perfs' && (
                <div className="lb-fade space-y-5" style={{ animationDelay: '140ms' }}>
                  {/* Stats cards */}
                  {perfMeta && (
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                      {[
                        {
                          icon: <IconRoute />,
                          label: 'Distance totale',
                          value: `${perfMeta.total_distance.toFixed(1)} km`,
                          color: '#FB3936',
                        },
                        {
                          icon: <IconRun />,
                          label: 'Sorties',
                          value: String(perfMeta.total_sessions),
                          color: '#D42F2D',
                        },
                        {
                          icon: <IconAvg />,
                          label: 'Moy. / sortie',
                          value:
                            perfMeta.total_sessions > 0
                              ? `${(perfMeta.total_distance / perfMeta.total_sessions).toFixed(1)} km`
                              : '—',
                          color: '#d97706',
                        },
                      ].map((stat) => (
                        <div key={stat.label} className="lb-stat-card">
                          <div className="flex justify-center" style={{ color: stat.color }}>
                            {stat.icon}
                          </div>
                          <p
                            className="mt-1 text-2xl font-extrabold"
                            style={{ color: stat.color, letterSpacing: '-0.02em' }}
                          >
                            {stat.value}
                          </p>
                          <p className="mt-0.5 text-xs" style={{ color: '#7F7F7F' }}>
                            {stat.label}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {perfLoading ? (
                    <div className="flex h-48 items-center justify-center">
                      <div className="flex flex-col items-center gap-3">
                        <div
                          className="h-8 w-8 animate-spin rounded-full border-2"
                          style={{ borderColor: 'rgba(192,48,46,0.1)', borderTopColor: '#FB3936' }}
                        />
                        <p className="text-sm" style={{ color: '#7F7F7F' }}>
                          Chargement…
                        </p>
                      </div>
                    </div>
                  ) : performances.length === 0 ? (
                    <div
                      className="flex h-48 flex-col items-center justify-center gap-3 rounded-2xl bg-white"
                      style={{ border: '1px solid rgba(192,48,46,0.07)' }}
                    >
                      <div style={{ opacity: 0.3, color: '#D42F2D' }}>
                        <IconEmptyFlag />
                      </div>
                      <p className="text-sm" style={{ color: '#7F7F7F' }}>
                        Aucune performance enregistrée.
                      </p>
                      <button
                        onClick={() => {
                          setShowForm(true)
                          setTab('leaderboard')
                        }}
                        className="text-xs font-semibold hover:underline"
                        style={{ color: '#FB3936' }}
                      >
                        Saisir ma première performance →
                      </button>
                    </div>
                  ) : (
                    <div
                      className="overflow-hidden rounded-2xl bg-white"
                      style={{
                        boxShadow: '0 2px 12px rgba(192,48,46,0.07)',
                        border: '1px solid rgba(192,48,46,0.07)',
                      }}
                    >
                      {/* En-tête table */}
                      <div
                        className="grid grid-cols-12 border-b px-5 py-3"
                        style={{ borderColor: 'rgba(192,48,46,0.06)', background: '#F8F8F8' }}
                      >
                        <div
                          className="col-span-4 text-[11px] font-bold tracking-wider uppercase"
                          style={{ color: '#7F7F7F' }}
                        >
                          Date
                        </div>
                        <div
                          className="col-span-3 text-right text-[11px] font-bold tracking-wider uppercase"
                          style={{ color: '#7F7F7F' }}
                        >
                          Distance
                        </div>
                        <div
                          className="col-span-2 hidden text-right text-[11px] font-bold tracking-wider uppercase sm:block"
                          style={{ color: '#7F7F7F' }}
                        >
                          Durée
                        </div>
                        <div
                          className="col-span-2 hidden text-right text-[11px] font-bold tracking-wider uppercase sm:block"
                          style={{ color: '#7F7F7F' }}
                        >
                          Allure
                        </div>
                        {/* Colonne action (vide dans l'en-tête) */}
                        <div className="col-span-3 sm:col-span-1" />
                      </div>

                      {/* Lignes de performances */}
                      {performances.map((p, i) => {
                        const pace =
                          p.duration_sec > 0 && p.distance_km > 0
                            ? Math.round(p.duration_sec / p.distance_km)
                            : null
                        const isConfirming = deletingId === p.id
                        return (
                          <div
                            key={p.id}
                            className="lb-row grid grid-cols-12 items-center px-5 py-3.5"
                            style={{
                              borderBottom:
                                i < performances.length - 1
                                  ? '1px solid rgba(192,48,46,0.04)'
                                  : 'none',
                            }}
                          >
                            <div className="col-span-4 text-sm" style={{ color: '#D42F2D' }}>
                              {formatDate(p.date)}
                            </div>
                            <div className="col-span-3 text-right">
                              <span className="text-sm font-bold" style={{ color: '#C0302E' }}>
                                {p.distance_km.toFixed(2)}
                              </span>
                              <span className="ml-1 text-xs" style={{ color: '#7F7F7F' }}>
                                km
                              </span>
                            </div>
                            <div
                              className="col-span-2 hidden text-right text-sm sm:block"
                              style={{ color: '#7F7F7F' }}
                            >
                              {formatDuration(p.duration_sec)}
                            </div>
                            <div className="col-span-2 hidden text-right sm:block">
                              {pace ? (
                                <span
                                  className="rounded-full px-2 py-0.5 text-[11px] font-semibold"
                                  style={{ background: 'rgba(169,50,38,0.08)', color: '#D42F2D' }}
                                >
                                  {formatDuration(pace)}/km
                                </span>
                              ) : (
                                '—'
                              )}
                            </div>
                            {/* Colonne action */}
                            <div className="col-span-3 flex justify-end sm:col-span-1">
                              {isConfirming ? (
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => handleDelete(p)}
                                    className="rounded-lg px-2 py-1 text-[10px] font-bold text-white transition"
                                    style={{ background: '#FB3936' }}
                                  >
                                    Oui
                                  </button>
                                  <button
                                    onClick={() => setDeletingId(null)}
                                    className="rounded-lg px-2 py-1 text-[10px] font-medium transition"
                                    style={{
                                      color: '#7F7F7F',
                                      border: '1px solid rgba(192,48,46,0.15)',
                                    }}
                                  >
                                    Non
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setDeletingId(p.id)}
                                  className="lb-trash flex items-center justify-center rounded-lg p-1.5 transition"
                                  title="Supprimer cette performance"
                                >
                                  <IconTrash />
                                </button>
                              )}
                            </div>
                          </div>
                        )
                      })}

                      {perfMeta && perfMeta.last_page > 1 && (
                        <div
                          className="flex items-center justify-between px-5 py-3"
                          style={{ borderTop: '1px solid rgba(192,48,46,0.06)' }}
                        >
                          <p className="text-xs" style={{ color: '#7F7F7F' }}>
                            Page {perfMeta.current_page} sur {perfMeta.last_page}
                          </p>
                          <div className="flex gap-2">
                            <button
                              disabled={perfPage <= 1}
                              onClick={() => setPerfPage((p) => p - 1)}
                              className="rounded-xl px-3 py-1.5 text-xs font-medium transition disabled:opacity-30"
                              style={{
                                border: '1px solid rgba(192,48,46,0.12)',
                                color: '#D42F2D',
                                background: 'white',
                              }}
                            >
                              ← Préc.
                            </button>
                            <button
                              disabled={perfPage >= perfMeta.last_page}
                              onClick={() => setPerfPage((p) => p + 1)}
                              className="rounded-xl px-3 py-1.5 text-xs font-medium transition disabled:opacity-30"
                              style={{
                                border: '1px solid rgba(192,48,46,0.12)',
                                color: '#D42F2D',
                                background: 'white',
                              }}
                            >
                              Suiv. →
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  )
}
