'use client'

import { useEffect, useState, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { useRole } from '@/hooks/useRole'
import {
  getBudgetEntries,
  getBudgetSummary,
  deleteBudgetEntry,
  exportBudgetCSV,
} from '@/lib/budget'
import type { BudgetEntry, BudgetSummary, BudgetListMeta } from '@/types'
import BudgetEntryForm from './BudgetEntryForm'

const BudgetChart = dynamic(() => import('./BudgetChart'), { ssr: false })

// ─── Icons ────────────────────────────────────────────────────────────────────

function IconTrend({ up }: { up: boolean }) {
  return up ? (
    <svg
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  ) : (
    <svg
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
      <polyline points="17 18 23 18 23 12" />
    </svg>
  )
}

function IconDownload() {
  return (
    <svg
      width={14}
      height={14}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  )
}

function IconEdit() {
  return (
    <svg
      width={13}
      height={13}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  )
}

function IconTrash() {
  return (
    <svg
      width={13}
      height={13}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
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

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtEuro(n: number) {
  return n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €'
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

const TYPE_LABEL: Record<string, string> = { recette: 'Recette', depense: 'Dépense' }

// ─── Component ────────────────────────────────────────────────────────────────

interface Filters {
  type: '' | 'recette' | 'depense'
  category: string
  from: string
  to: string
}

const CURRENT_YEAR = new Date().getFullYear()

export default function BudgetPage() {
  const { canManageEvents } = useRole()
  const router = useRouter()

  const [summary, setSummary] = useState<BudgetSummary | null>(null)
  const [entries, setEntries] = useState<BudgetEntry[]>([])
  const [meta, setMeta] = useState<BudgetListMeta | null>(null)
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)

  // Export date range (indépendant des filtres de liste)
  const [exportFrom, setExportFrom] = useState(`${CURRENT_YEAR}-01-01`)
  const [exportTo, setExportTo] = useState(`${CURRENT_YEAR}-12-31`)
  const [toast, setToast] = useState<string | null>(null)
  const [showAll, setShowAll] = useState(false)
  const [page, setPage] = useState(1)

  // Form state
  type FormMode = { open: false } | { open: true; type: 'recette' | 'depense'; entry?: BudgetEntry }
  const [formMode, setFormMode] = useState<FormMode>({ open: false })
  const [deleteConfirm, setDeleteConfirm] = useState<BudgetEntry | null>(null)
  const [deleting, setDeleting] = useState(false)

  const [filters, setFilters] = useState<Filters>({
    type: '',
    category: '',
    from: '',
    to: '',
  })

  const [yearFilter, setYearFilter] = useState<number>(CURRENT_YEAR)

  // Years available (current ± 3)
  const years = useMemo(() => {
    const ys: number[] = []
    for (let y = CURRENT_YEAR - 2; y <= CURRENT_YEAR + 1; y++) ys.push(y)
    return ys
  }, [])

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  // Load summary
  useEffect(() => {
    if (!canManageEvents) {
      router.replace('/tableau-de-bord')
      return
    }
    getBudgetSummary()
      .then(setSummary)
      .catch(() => {})
  }, [canManageEvents, router])

  // Load entries (recent 10 or full list with filters)
  useEffect(() => {
    if (!canManageEvents) return
    setLoading(true)

    const params = showAll
      ? {
          type: filters.type || undefined,
          category: filters.category || undefined,
          from: filters.from || `${yearFilter}-01-01`,
          to: filters.to || `${yearFilter}-12-31`,
          per_page: 50,
          page,
        }
      : { per_page: 10, page: 1 }

    getBudgetEntries(params)
      .then((res) => {
        setEntries(res.data)
        setMeta(res.meta)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [canManageEvents, showAll, filters, yearFilter, page])

  const handleSaved = (saved: BudgetEntry) => {
    setFormMode({ open: false })
    // Refetch entries + summary
    getBudgetSummary()
      .then(setSummary)
      .catch(() => {})
    getBudgetEntries(
      showAll
        ? {
            type: filters.type || undefined,
            category: filters.category || undefined,
            from: filters.from || `${yearFilter}-01-01`,
            to: filters.to || `${yearFilter}-12-31`,
            per_page: 50,
            page,
          }
        : { per_page: 10, page: 1 }
    )
      .then((res) => {
        setEntries(res.data)
        setMeta(res.meta)
      })
      .catch(() => {})
    showToast(
      saved.id && formMode.open && (formMode as { entry?: BudgetEntry }).entry
        ? 'Mouvement modifié.'
        : 'Mouvement enregistré.'
    )
  }

  const handleDelete = async () => {
    if (!deleteConfirm) return
    setDeleting(true)
    try {
      await deleteBudgetEntry(deleteConfirm.id)
      setDeleteConfirm(null)
      getBudgetSummary()
        .then(setSummary)
        .catch(() => {})
      getBudgetEntries(
        showAll
          ? {
              type: filters.type || undefined,
              category: filters.category || undefined,
              from: filters.from || `${yearFilter}-01-01`,
              to: filters.to || `${yearFilter}-12-31`,
              per_page: 50,
              page,
            }
          : { per_page: 10, page: 1 }
      )
        .then((res) => {
          setEntries(res.data)
          setMeta(res.meta)
        })
        .catch(() => {})
      showToast('Mouvement supprimé.')
    } catch {
      showToast('Erreur lors de la suppression.')
    } finally {
      setDeleting(false)
    }
  }

  const handleExport = async () => {
    setExporting(true)
    try {
      await exportBudgetCSV(exportFrom || undefined, exportTo || undefined)
    } catch {
      showToast("Erreur lors de l'export.")
    } finally {
      setExporting(false)
    }
  }

  if (!summary && loading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <div
          className="h-8 w-8 animate-spin rounded-full border-2"
          style={{ borderColor: 'rgba(192,48,46,0.1)', borderTopColor: '#FB3936' }}
        />
      </div>
    )
  }

  // Top categories total for percentages
  const topTotal = summary?.top_categories.reduce((acc, c) => acc + c.total, 0) ?? 0

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@400;500;600;700;800&display=swap');
        .bgt { font-family: 'Baloo 2', sans-serif; }
        .bgt-card { background: white; border-radius: 20px; box-shadow: 0 2px 12px rgba(192,48,46,0.07); border: 1px solid rgba(192,48,46,0.08); }
        .bgt-th { padding: 10px 14px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #7F7F7F; text-align: left; }
        .bgt-td { padding: 11px 14px; font-size: 13.5px; color: #2C2C2C; border-top: 1px solid rgba(192,48,46,0.05); }
        .bgt-tr:hover td { background: rgba(251,57,54,0.02); }
        .bgt-badge-r { background: rgba(5,150,105,0.1); color: #059669; border-radius: 20px; padding: 2px 10px; font-size: 12px; font-weight: 700; display: inline-block; }
        .bgt-badge-d { background: rgba(251,57,54,0.1);  color: #D42F2D; border-radius: 20px; padding: 2px 10px; font-size: 12px; font-weight: 700; display: inline-block; }
        .bgt-select { border: 1px solid rgba(192,48,46,0.15); border-radius: 10px; padding: 7px 11px; font-size: 13px; font-family: inherit; outline: none; background: white; color: #2C2C2C; }
        .bgt-input  { border: 1px solid rgba(192,48,46,0.15); border-radius: 10px; padding: 7px 11px; font-size: 13px; font-family: inherit; outline: none; }
      `}</style>

      <div className="bgt min-h-screen pb-24 lg:pb-8" style={{ background: '#F8F8F8' }}>
        <div className="mx-auto max-w-4xl space-y-5 px-5 py-8">
          {/* Header */}
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1
                className="text-2xl font-extrabold"
                style={{ color: '#C0302E', letterSpacing: '-0.02em' }}
              >
                Budget
              </h1>
              <p className="mt-0.5 text-sm" style={{ color: '#7F7F7F' }}>
                Suivi financier de l&apos;association
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              {/* Saisie */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setFormMode({ open: true, type: 'depense' })}
                  className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-bold text-white"
                  style={{
                    background: 'linear-gradient(135deg, #FB3936 0%, #D42F2D 100%)',
                    boxShadow: '0 2px 8px rgba(251,57,54,0.3)',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  + Dépense
                </button>
                <button
                  onClick={() => setFormMode({ open: true, type: 'recette' })}
                  className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-bold"
                  style={{
                    background: 'rgba(5,150,105,0.1)',
                    color: '#059669',
                    border: '1px solid rgba(5,150,105,0.2)',
                    cursor: 'pointer',
                  }}
                >
                  + Recette
                </button>
              </div>
              {/* Export CSV avec sélecteur De/À */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold" style={{ color: '#7F7F7F' }}>
                  Export :
                </span>
                <span className="text-xs" style={{ color: '#7F7F7F' }}>
                  De
                </span>
                <input
                  type="date"
                  className="bgt-input"
                  value={exportFrom}
                  onChange={(e) => setExportFrom(e.target.value)}
                  style={{ padding: '5px 10px', fontSize: '12px' }}
                />
                <span className="text-xs" style={{ color: '#7F7F7F' }}>
                  À
                </span>
                <input
                  type="date"
                  className="bgt-input"
                  value={exportTo}
                  onChange={(e) => setExportTo(e.target.value)}
                  style={{ padding: '5px 10px', fontSize: '12px' }}
                />
                <button
                  onClick={handleExport}
                  disabled={exporting}
                  className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-bold"
                  style={{
                    background: 'rgba(192,48,46,0.08)',
                    color: '#C0302E',
                    border: '1px solid rgba(192,48,46,0.15)',
                    cursor: 'pointer',
                    opacity: exporting ? 0.5 : 1,
                  }}
                >
                  <IconDownload />
                  {exporting ? 'Export…' : 'CSV'}
                </button>
              </div>
              {/* Filtre année graphique */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold" style={{ color: '#7F7F7F' }}>
                  Graphique :
                </span>
                <select
                  className="bgt-select"
                  value={yearFilter}
                  onChange={(e) => {
                    setYearFilter(parseInt(e.target.value))
                    setPage(1)
                  }}
                  style={{ padding: '5px 10px', fontSize: '12px' }}
                >
                  {years.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Stat cards */}
          {summary && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {/* Solde */}
              <div className="bgt-card sm:col-span-1" style={{ padding: '20px 24px' }}>
                <p
                  className="mb-2 text-xs font-bold tracking-wider uppercase"
                  style={{ color: '#7F7F7F' }}
                >
                  Solde
                </p>
                <p
                  className="text-3xl font-extrabold"
                  style={{
                    color: summary.solde >= 0 ? '#059669' : '#D42F2D',
                    lineHeight: 1,
                    letterSpacing: '-0.02em',
                  }}
                >
                  {fmtEuro(summary.solde)}
                </p>
                <p
                  className="mt-1.5 flex items-center gap-1 text-xs"
                  style={{ color: summary.solde >= 0 ? '#059669' : '#D42F2D' }}
                >
                  <IconTrend up={summary.solde >= 0} />
                  {summary.solde >= 0 ? 'Positif' : 'Négatif'}
                </p>
              </div>

              {/* Recettes */}
              <div className="bgt-card" style={{ padding: '20px 24px' }}>
                <p
                  className="mb-2 text-xs font-bold tracking-wider uppercase"
                  style={{ color: '#7F7F7F' }}
                >
                  Total recettes
                </p>
                <p className="text-2xl font-extrabold" style={{ color: '#059669', lineHeight: 1 }}>
                  {fmtEuro(summary.total_recettes)}
                </p>
              </div>

              {/* Dépenses */}
              <div className="bgt-card" style={{ padding: '20px 24px' }}>
                <p
                  className="mb-2 text-xs font-bold tracking-wider uppercase"
                  style={{ color: '#7F7F7F' }}
                >
                  Total dépenses
                </p>
                <p className="text-2xl font-extrabold" style={{ color: '#D42F2D', lineHeight: 1 }}>
                  {fmtEuro(summary.total_depenses)}
                </p>
              </div>
            </div>
          )}

          {/* Chart + categories */}
          {summary && (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              {/* Bar chart */}
              <div className="bgt-card lg:col-span-2" style={{ padding: '20px 24px' }}>
                <p className="mb-4 text-sm font-bold" style={{ color: '#1A1A1A' }}>
                  Recettes vs Dépenses — 12 derniers mois
                </p>
                <BudgetChart data={summary.monthly} />
              </div>

              {/* Top catégories */}
              <div className="bgt-card" style={{ padding: '20px 24px' }}>
                <p className="mb-4 text-sm font-bold" style={{ color: '#1A1A1A' }}>
                  Top dépenses par catégorie
                </p>
                {summary.top_categories.length === 0 ? (
                  <p className="text-sm" style={{ color: '#7F7F7F' }}>
                    Aucune dépense enregistrée.
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {summary.top_categories.map((cat) => {
                      const pct = topTotal > 0 ? Math.round((cat.total / topTotal) * 100) : 0
                      return (
                        <div key={cat.category}>
                          <div className="mb-1 flex items-baseline justify-between">
                            <span
                              className="text-xs font-semibold capitalize"
                              style={{ color: '#2C2C2C' }}
                            >
                              {cat.category}
                            </span>
                            <span className="text-xs" style={{ color: '#7F7F7F' }}>
                              {pct}% · {fmtEuro(cat.total)}
                            </span>
                          </div>
                          <div
                            style={{
                              height: '5px',
                              borderRadius: '3px',
                              background: 'rgba(192,48,46,0.08)',
                            }}
                          >
                            <div
                              style={{
                                height: '100%',
                                width: `${pct}%`,
                                background: '#FB3936',
                                borderRadius: '3px',
                                transition: 'width 0.4s ease',
                              }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Movements list */}
          <div className="bgt-card">
            <div
              style={{
                padding: '12px 16px',
                borderBottom: '1px solid rgba(192,48,46,0.07)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '8px',
              }}
            >
              <p className="text-sm font-bold" style={{ color: '#1A1A1A' }}>
                {showAll ? 'Tous les mouvements' : '10 derniers mouvements'}
              </p>

              {showAll && (
                <div className="flex flex-wrap items-center gap-2">
                  <select
                    className="bgt-select"
                    value={filters.type}
                    onChange={(e) => {
                      setFilters((f) => ({ ...f, type: e.target.value as Filters['type'] }))
                      setPage(1)
                    }}
                  >
                    <option value="">Tous les types</option>
                    <option value="recette">Recettes</option>
                    <option value="depense">Dépenses</option>
                  </select>
                  <input
                    type="text"
                    className="bgt-input"
                    placeholder="Catégorie…"
                    value={filters.category}
                    onChange={(e) => {
                      setFilters((f) => ({ ...f, category: e.target.value }))
                      setPage(1)
                    }}
                  />
                  <input
                    type="date"
                    className="bgt-input"
                    value={filters.from}
                    onChange={(e) => {
                      setFilters((f) => ({ ...f, from: e.target.value }))
                      setPage(1)
                    }}
                  />
                  <input
                    type="date"
                    className="bgt-input"
                    value={filters.to}
                    onChange={(e) => {
                      setFilters((f) => ({ ...f, to: e.target.value }))
                      setPage(1)
                    }}
                  />
                </div>
              )}
            </div>

            {loading ? (
              <div className="flex justify-center py-10">
                <div
                  className="h-6 w-6 animate-spin rounded-full border-2"
                  style={{ borderColor: 'rgba(192,48,46,0.1)', borderTopColor: '#FB3936' }}
                />
              </div>
            ) : entries.length === 0 ? (
              <div className="py-10 text-center">
                <p className="text-sm" style={{ color: '#7F7F7F' }}>
                  Aucun mouvement enregistré.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: 'rgba(251,57,54,0.02)' }}>
                      <th className="bgt-th">Date</th>
                      <th className="bgt-th">Type</th>
                      <th className="bgt-th">Catégorie</th>
                      <th className="bgt-th">Description</th>
                      <th className="bgt-th" style={{ textAlign: 'right' }}>
                        Montant
                      </th>
                      <th className="bgt-th" style={{ width: '80px' }} />
                    </tr>
                  </thead>
                  <tbody>
                    {entries.map((e: BudgetEntry) => (
                      <tr key={e.id} className="bgt-tr">
                        <td className="bgt-td" style={{ color: '#7F7F7F', whiteSpace: 'nowrap' }}>
                          {fmtDate(e.entry_date)}
                        </td>
                        <td className="bgt-td">
                          <span className={e.type === 'recette' ? 'bgt-badge-r' : 'bgt-badge-d'}>
                            {TYPE_LABEL[e.type]}
                          </span>
                        </td>
                        <td className="bgt-td capitalize" style={{ color: '#7F7F7F' }}>
                          {e.category}
                        </td>
                        <td
                          className="bgt-td"
                          style={{
                            color: '#7F7F7F',
                            maxWidth: '200px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {e.description ?? '—'}
                        </td>
                        <td
                          className="bgt-td font-bold"
                          style={{
                            textAlign: 'right',
                            color: e.type === 'recette' ? '#059669' : '#D42F2D',
                          }}
                        >
                          {e.type === 'depense' ? '-' : '+'}
                          {fmtEuro(e.amount)}
                        </td>
                        <td className="bgt-td">
                          <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
                            <button
                              onClick={(ev) => {
                                ev.stopPropagation()
                                setFormMode({ open: true, type: e.type, entry: e })
                              }}
                              title="Modifier"
                              style={{
                                borderRadius: '7px',
                                padding: '5px 7px',
                                border: '1px solid rgba(192,48,46,0.15)',
                                background: 'white',
                                color: '#C0302E',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                              }}
                            >
                              <IconEdit />
                            </button>
                            <button
                              onClick={(ev) => {
                                ev.stopPropagation()
                                setDeleteConfirm(e)
                              }}
                              title="Supprimer"
                              style={{
                                borderRadius: '7px',
                                padding: '5px 7px',
                                border: '1px solid rgba(251,57,54,0.15)',
                                background: 'rgba(251,57,54,0.05)',
                                color: '#D42F2D',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                              }}
                            >
                              <IconTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination (mode showAll) */}
            {showAll && meta && meta.last_page > 1 && (
              <div
                style={{
                  padding: '12px 16px',
                  borderTop: '1px solid rgba(192,48,46,0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <p style={{ fontSize: '12px', color: '#7F7F7F' }}>
                  Page {meta.current_page} / {meta.last_page} — {meta.total} entrées
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    style={{
                      borderRadius: '8px',
                      padding: '5px 12px',
                      fontSize: '12px',
                      fontWeight: 600,
                      border: '1px solid rgba(192,48,46,0.15)',
                      background: 'white',
                      color: '#C0302E',
                      cursor: 'pointer',
                      opacity: page === 1 ? 0.4 : 1,
                    }}
                  >
                    ← Préc.
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(meta.last_page, p + 1))}
                    disabled={page === meta.last_page}
                    style={{
                      borderRadius: '8px',
                      padding: '5px 12px',
                      fontSize: '12px',
                      fontWeight: 600,
                      border: '1px solid rgba(192,48,46,0.15)',
                      background: 'white',
                      color: '#C0302E',
                      cursor: 'pointer',
                      opacity: page === meta.last_page ? 0.4 : 1,
                    }}
                  >
                    Suiv. →
                  </button>
                </div>
              </div>
            )}

            {/* Footer: "Voir tout" / "Réduire" */}
            <div
              style={{
                padding: '10px 16px',
                borderTop: '1px solid rgba(192,48,46,0.05)',
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              <button
                onClick={() => {
                  setShowAll((v) => !v)
                  setPage(1)
                }}
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#C0302E',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                {showAll ? '↑ Réduire' : 'Voir tous les mouvements →'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Form modal */}
      {formMode.open && (
        <BudgetEntryForm
          entry={formMode.entry}
          defaultType={formMode.type}
          onSaved={handleSaved}
          onCancel={() => setFormMode({ open: false })}
        />
      )}

      {/* Delete confirmation modal */}
      {deleteConfirm && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 50,
            background: 'rgba(0,0,0,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '20px',
              padding: '28px 32px',
              maxWidth: '400px',
              width: '100%',
              fontFamily: "'Baloo 2', sans-serif",
              boxShadow: '0 8px 40px rgba(0,0,0,0.16)',
            }}
          >
            <h3
              style={{ fontSize: '17px', fontWeight: 800, color: '#1A1A1A', marginBottom: '8px' }}
            >
              Supprimer ce mouvement ?
            </h3>
            <p style={{ fontSize: '13.5px', color: '#7F7F7F', marginBottom: '4px' }}>
              <strong style={{ color: '#2C2C2C' }}>
                {deleteConfirm.type === 'recette' ? '+' : '-'}
                {fmtEuro(deleteConfirm.amount)}
              </strong>{' '}
              — {deleteConfirm.category}
            </p>
            <p style={{ fontSize: '12px', color: '#7F7F7F', marginBottom: '20px' }}>
              {deleteConfirm.description ?? ''}
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => setDeleteConfirm(null)}
                style={{
                  borderRadius: '12px',
                  padding: '9px 20px',
                  fontSize: '13.5px',
                  fontWeight: 700,
                  color: '#2C2C2C',
                  background: 'rgba(0,0,0,0.06)',
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                style={{
                  borderRadius: '12px',
                  padding: '9px 20px',
                  fontSize: '13.5px',
                  fontWeight: 700,
                  color: 'white',
                  background: 'linear-gradient(135deg, #FB3936 0%, #D42F2D 100%)',
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  opacity: deleting ? 0.5 : 1,
                }}
              >
                {deleting ? 'Suppression…' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 999,
            padding: '12px 18px',
            borderRadius: '12px',
            background: 'white',
            border: '1px solid rgba(251,57,54,0.2)',
            fontSize: '14px',
            fontWeight: 500,
            fontFamily: "'Baloo 2', sans-serif",
            boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
            color: '#1A1A1A',
          }}
        >
          {toast}
        </div>
      )}
    </>
  )
}
