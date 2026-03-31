'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useRole } from '@/hooks/useRole'
import { getEquipmentDetail, returnEquipment } from '@/lib/inventory'
import type { EquipmentDetail, EquipmentAssignment, EquipmentStatus } from '@/types'
import AssignmentModal from './AssignmentModal'

const STATUS_CONFIG: Record<EquipmentStatus, { label: string; bg: string; color: string }> = {
  good: { label: 'Bon état', bg: 'rgba(16,185,129,0.1)', color: '#059669' },
  worn: { label: 'Usé', bg: 'rgba(245,158,11,0.1)', color: '#d97706' },
  broken: { label: 'Hors service', bg: 'rgba(251,57,54,0.1)', color: '#D42F2D' },
}

function IconArrow() {
  return (
    <svg
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 12H5M12 5l-7 7 7 7" />
    </svg>
  )
}

function IconBox() {
  return (
    <svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  )
}

type DetailTab = 'actives' | 'history'

interface Props {
  id: number
}

export default function EquipmentDetailPage({ id }: Props) {
  const { canManageEvents } = useRole()
  const router = useRouter()

  const [item, setItem] = useState<EquipmentDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<DetailTab>('actives')
  const [showAssign, setShowAssign] = useState(false)
  const [returning, setReturning] = useState<number | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    if (!canManageEvents) {
      router.replace('/tableau-de-bord')
      return
    }
    getEquipmentDetail(id)
      .then(setItem)
      .catch(() => router.replace('/tableau-de-bord/inventaire'))
      .finally(() => setLoading(false))
  }, [id, canManageEvents, router])

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const handleReturn = async (assignmentId: number) => {
    setReturning(assignmentId)
    try {
      await returnEquipment(assignmentId)
      setItem((prev) => {
        if (!prev) return prev
        const assignment = prev.active_assignments.find((a) => a.id === assignmentId)
        const returned = assignment
          ? { ...assignment, returned_at: new Date().toISOString() }
          : null
        return {
          ...prev,
          active_assignments: prev.active_assignments.filter((a) => a.id !== assignmentId),
          assignment_history: returned
            ? [returned, ...prev.assignment_history]
            : prev.assignment_history,
          assigned_count: Math.max(0, prev.assigned_count - 1),
          available_count: prev.available_count + 1,
        }
      })
      showToast('Équipement marqué comme rendu.')
    } catch {
      showToast('Erreur lors du retour.')
    } finally {
      setReturning(null)
    }
  }

  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <div
          className="h-8 w-8 animate-spin rounded-full border-2"
          style={{ borderColor: 'rgba(192,48,46,0.1)', borderTopColor: '#FB3936' }}
        />
      </div>
    )
  }

  if (!item) return null

  const sc = STATUS_CONFIG[item.status]

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@400;500;600;700;800&display=swap');
        .eqd { font-family: 'Baloo 2', sans-serif; }
        .eqd-card { background: white; border-radius: 20px; box-shadow: 0 2px 12px rgba(192,48,46,0.07); border: 1px solid rgba(192,48,46,0.08); overflow: hidden; }
        .eqd-tab { padding: 8px 18px; border-radius: 10px; font-size: 13.5px; font-weight: 600; border: none; cursor: pointer; transition: background 0.15s; background: none; }
        .eqd-tab.active { background: rgba(251,57,54,0.1); color: #D42F2D; }
        .eqd-tab:not(.active) { color: #7F7F7F; }
        .eqd-tab:not(.active):hover { background: rgba(0,0,0,0.04); }
        .eqd-th { padding: 10px 16px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #7F7F7F; text-align: left; }
        .eqd-td { padding: 12px 16px; font-size: 13.5px; color: #2C2C2C; border-top: 1px solid rgba(192,48,46,0.05); }
        .eqd-tr:hover td { background: rgba(251,57,54,0.02); }
      `}</style>

      <div className="eqd min-h-screen pb-24 lg:pb-8" style={{ background: '#F8F8F8' }}>
        <div className="mx-auto max-w-3xl space-y-5 px-5 py-8">
          {/* Back + Header */}
          <div>
            <button
              onClick={() => router.push('/tableau-de-bord/inventaire')}
              className="mb-4 flex items-center gap-2 text-sm font-semibold"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7F7F7F' }}
            >
              <IconArrow /> Retour à l&apos;inventaire
            </button>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div style={{ color: '#D42F2D' }}>
                  <IconBox />
                </div>
                <div>
                  <h1
                    className="text-2xl font-extrabold"
                    style={{ color: '#C0302E', letterSpacing: '-0.02em' }}
                  >
                    {item.name}
                  </h1>
                  <p className="text-sm" style={{ color: '#7F7F7F' }}>
                    {item.category}
                  </p>
                </div>
              </div>
              <span
                className="rounded-full px-3 py-1 text-sm font-bold"
                style={{ background: sc.bg, color: sc.color }}
              >
                {sc.label}
              </span>
            </div>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Quantité totale', value: item.quantity, color: '#FB3936' },
              { label: 'Attribués', value: item.assigned_count, color: '#d97706' },
              { label: 'Disponibles', value: item.available_count, color: '#059669' },
            ].map(({ label, value, color }) => (
              <div key={label} className="eqd-card" style={{ padding: '16px 20px' }}>
                <p className="text-2xl font-extrabold" style={{ color, lineHeight: 1 }}>
                  {value}
                </p>
                <p className="mt-1 text-xs" style={{ color: '#7F7F7F' }}>
                  {label}
                </p>
              </div>
            ))}
          </div>

          {item.notes && (
            <div className="eqd-card" style={{ padding: '16px 20px' }}>
              <p
                className="mb-1 text-xs font-bold tracking-wider uppercase"
                style={{ color: '#7F7F7F' }}
              >
                Notes
              </p>
              <p className="text-sm" style={{ color: '#2C2C2C' }}>
                {item.notes}
              </p>
            </div>
          )}

          {/* Attributions card */}
          <div className="eqd-card">
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                borderBottom: '1px solid rgba(192,48,46,0.07)',
                flexWrap: 'wrap',
                gap: '8px',
              }}
            >
              <div style={{ display: 'flex', gap: '4px' }}>
                <button
                  className={`eqd-tab${tab === 'actives' ? 'active' : ''}`}
                  onClick={() => setTab('actives')}
                >
                  Actives ({item.active_assignments.length})
                </button>
                <button
                  className={`eqd-tab${tab === 'history' ? 'active' : ''}`}
                  onClick={() => setTab('history')}
                >
                  Historique ({item.assignment_history.length})
                </button>
              </div>
              {item.available_count > 0 && (
                <button
                  onClick={() => setShowAssign(true)}
                  className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-bold text-white"
                  style={{
                    background: 'linear-gradient(135deg, #FB3936 0%, #D42F2D 100%)',
                    boxShadow: '0 2px 8px rgba(251,57,54,0.3)',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  + Attribuer
                </button>
              )}
            </div>

            {/* Tab actives */}
            {tab === 'actives' && (
              <>
                {item.active_assignments.length === 0 ? (
                  <div className="py-10 text-center">
                    <p className="text-sm" style={{ color: '#7F7F7F' }}>
                      Aucune attribution active.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ background: 'rgba(251,57,54,0.02)' }}>
                          <th className="eqd-th">Membre</th>
                          <th className="eqd-th">Attribué le</th>
                          <th className="eqd-th">Notes</th>
                          <th className="eqd-th" style={{ width: '120px' }} />
                        </tr>
                      </thead>
                      <tbody>
                        {item.active_assignments.map((a: EquipmentAssignment) => (
                          <tr key={a.id} className="eqd-tr">
                            <td className="eqd-td font-semibold">
                              {a.user ? `${a.user.first_name} ${a.user.last_name}` : '—'}
                              {a.user && (
                                <p className="text-xs font-normal" style={{ color: '#7F7F7F' }}>
                                  {a.user.email}
                                </p>
                              )}
                            </td>
                            <td
                              className="eqd-td"
                              style={{ color: '#7F7F7F', whiteSpace: 'nowrap' }}
                            >
                              {new Date(a.assigned_at).toLocaleDateString('fr-FR', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </td>
                            <td className="eqd-td" style={{ color: '#7F7F7F' }}>
                              {a.notes ?? '—'}
                            </td>
                            <td className="eqd-td">
                              <button
                                onClick={() => handleReturn(a.id)}
                                disabled={returning === a.id}
                                className="rounded-xl px-3 py-1.5 text-xs font-bold transition disabled:opacity-40"
                                style={{
                                  background: 'rgba(192,48,46,0.08)',
                                  color: '#C0302E',
                                  border: '1px solid rgba(192,48,46,0.15)',
                                  cursor: 'pointer',
                                }}
                              >
                                {returning === a.id ? '…' : 'Marquer rendu'}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}

            {/* Tab historique */}
            {tab === 'history' && (
              <>
                {item.assignment_history.length === 0 ? (
                  <div className="py-10 text-center">
                    <p className="text-sm" style={{ color: '#7F7F7F' }}>
                      Aucun historique d&apos;attribution.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ background: 'rgba(251,57,54,0.02)' }}>
                          <th className="eqd-th">Membre</th>
                          <th className="eqd-th">Attribué le</th>
                          <th className="eqd-th">Rendu le</th>
                          <th className="eqd-th">Statut</th>
                        </tr>
                      </thead>
                      <tbody>
                        {item.assignment_history.map((a: EquipmentAssignment) => (
                          <tr key={a.id} className="eqd-tr">
                            <td className="eqd-td font-semibold">
                              {a.user ? `${a.user.first_name} ${a.user.last_name}` : '—'}
                            </td>
                            <td
                              className="eqd-td"
                              style={{ color: '#7F7F7F', whiteSpace: 'nowrap' }}
                            >
                              {new Date(a.assigned_at).toLocaleDateString('fr-FR', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </td>
                            <td
                              className="eqd-td"
                              style={{ color: '#7F7F7F', whiteSpace: 'nowrap' }}
                            >
                              {a.returned_at
                                ? new Date(a.returned_at).toLocaleDateString('fr-FR', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric',
                                  })
                                : '—'}
                            </td>
                            <td className="eqd-td">
                              <span
                                className="rounded-full px-2.5 py-0.5 text-xs font-bold"
                                style={
                                  a.returned_at
                                    ? { background: 'rgba(16,185,129,0.1)', color: '#059669' }
                                    : { background: 'rgba(251,57,54,0.1)', color: '#D42F2D' }
                                }
                              >
                                {a.returned_at ? 'Rendu' : 'En cours'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {showAssign && (
        <AssignmentModal
          equipmentId={item.id}
          equipmentName={item.name}
          onAssigned={(assignment) => {
            setItem((prev) =>
              prev
                ? {
                    ...prev,
                    active_assignments: [assignment, ...prev.active_assignments],
                    assignment_history: [assignment, ...prev.assignment_history],
                    assigned_count: prev.assigned_count + 1,
                    available_count: Math.max(0, prev.available_count - 1),
                  }
                : prev
            )
            setShowAssign(false)
            showToast('Attribution enregistrée.')
          }}
          onCancel={() => setShowAssign(false)}
        />
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
