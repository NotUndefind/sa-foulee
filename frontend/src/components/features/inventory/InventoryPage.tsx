'use client'

import { useEffect, useState } from 'react'
import { useRole } from '@/hooks/useRole'
import { useRouter } from 'next/navigation'
import {
  getInventory, createEquipment, updateEquipment, deleteEquipment,
  exportInventoryCSV, type EquipmentPayload,
} from '@/lib/inventory'
import type { Equipment, EquipmentCategory, EquipmentStatus } from '@/types'

// ─── Labels ──────────────────────────────────────────────────────────────────

const CATEGORY_LABELS: Record<EquipmentCategory, string> = {
  dossard:  'Dossard',
  maillot:  'Maillot',
  'matériel': 'Matériel',
  autre:    'Autre',
}

const STATUS_CONFIG: Record<EquipmentStatus, { label: string; bg: string; color: string }> = {
  good:   { label: 'Bon état',     bg: 'rgba(16,185,129,0.1)',  color: '#059669' },
  worn:   { label: 'Usé',          bg: 'rgba(245,158,11,0.1)',  color: '#d97706' },
  broken: { label: 'Hors service', bg: 'rgba(251,57,54,0.1)',   color: '#D42F2D' },
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function IconBox() {
  return <svg width={26} height={26} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
}

function IconPlus() {
  return <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
}

function IconEdit() {
  return <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
}

function IconTrash() {
  return <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
}

function IconDownload() {
  return <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
}

// ─── EquipmentForm ────────────────────────────────────────────────────────────

interface FormProps {
  initial?: Equipment
  onSave: (item: Equipment) => void
  onCancel: () => void
}

const EMPTY: EquipmentPayload = { name: '', category: 'autre', quantity: 1, status: 'good', notes: '' }

function EquipmentForm({ initial, onSave, onCancel }: FormProps) {
  const [form,    setForm]    = useState<EquipmentPayload>(
    initial ? { name: initial.name, category: initial.category, quantity: initial.quantity, status: initial.status, notes: initial.notes ?? '' }
            : { ...EMPTY }
  )
  const [saving,  setSaving]  = useState(false)
  const [error,   setError]   = useState<string | null>(null)

  const set = <K extends keyof EquipmentPayload>(k: K, v: EquipmentPayload[K]) =>
    setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) { setError('Le nom est requis.'); return }
    setSaving(true); setError(null)
    try {
      const saved = initial
        ? await updateEquipment(initial.id, form)
        : await createEquipment(form)
      onSave(saved)
    } catch {
      setError('Erreur lors de l\'enregistrement.')
    } finally { setSaving(false) }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="rounded-xl px-4 py-3 text-sm" style={{ background: 'rgba(251,57,54,0.06)', border: '1px solid rgba(251,57,54,0.2)', color: '#D42F2D' }}>{error}</div>}

      <div>
        <label className="inv-label">Nom *</label>
        <input className="inv-input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Ex : Dossard n°1" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="inv-label">Catégorie</label>
          <select className="inv-input" value={form.category} onChange={e => set('category', e.target.value as EquipmentCategory)}>
            {(Object.entries(CATEGORY_LABELS) as [EquipmentCategory, string][]).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="inv-label">Quantité</label>
          <input className="inv-input" type="number" min={1} value={form.quantity} onChange={e => set('quantity', parseInt(e.target.value) || 1)} />
        </div>
      </div>

      <div>
        <label className="inv-label">État</label>
        <select className="inv-input" value={form.status} onChange={e => set('status', e.target.value as EquipmentStatus)}>
          {(Object.entries(STATUS_CONFIG) as [EquipmentStatus, { label: string }][]).map(([v, { label }]) => (
            <option key={v} value={v}>{label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="inv-label">Notes <span style={{ color: '#7F7F7F', fontWeight: 400 }}>— optionnel</span></label>
        <textarea className="inv-input resize-none" rows={3} value={form.notes ?? ''} onChange={e => set('notes', e.target.value)} placeholder="Informations complémentaires…" />
      </div>

      <div className="flex justify-end gap-3 pt-1">
        <button type="button" onClick={onCancel} className="inv-btn-ghost">Annuler</button>
        <button type="submit" disabled={saving} className="inv-btn-primary">{saving ? 'Enregistrement…' : initial ? 'Modifier' : 'Ajouter'}</button>
      </div>
    </form>
  )
}

// ─── InventoryPage ────────────────────────────────────────────────────────────

export default function InventoryPage() {
  const { canManageEvents } = useRole()   // admin | founder | bureau
  const router              = useRouter()

  const [items,       setItems]       = useState<Equipment[]>([])
  const [loading,     setLoading]     = useState(true)
  const [filterCat,   setFilterCat]   = useState('')
  const [filterStat,  setFilterStat]  = useState('')
  const [showForm,    setShowForm]    = useState(false)
  const [editing,     setEditing]     = useState<Equipment | null>(null)
  const [deleting,    setDeleting]    = useState<Equipment | null>(null)
  const [exporting,   setExporting]   = useState(false)
  const [toast,       setToast]       = useState<string | null>(null)

  const { isAdmin, canManageUsers } = useRole()
  const canDelete = isAdmin || canManageUsers  // admin | founder

  useEffect(() => {
    if (!canManageEvents) { router.replace('/tableau-de-bord'); return }
    getInventory().then(setItems).catch(() => {}).finally(() => setLoading(false))
  }, [canManageEvents, router])

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000) }

  const filtered = items.filter(i =>
    (!filterCat  || i.category === filterCat) &&
    (!filterStat || i.status   === filterStat)
  )

  const counts = {
    good:   items.filter(i => i.status === 'good').length,
    worn:   items.filter(i => i.status === 'worn').length,
    broken: items.filter(i => i.status === 'broken').length,
  }

  const handleSaved = (item: Equipment) => {
    setItems(prev => {
      const idx = prev.findIndex(i => i.id === item.id)
      if (idx >= 0) { const next = [...prev]; next[idx] = item; return next }
      return [item, ...prev]
    })
    setShowForm(false); setEditing(null)
    showToast(editing ? 'Équipement modifié.' : 'Équipement ajouté.')
  }

  const handleDelete = async () => {
    if (!deleting) return
    try {
      await deleteEquipment(deleting.id)
      setItems(prev => prev.filter(i => i.id !== deleting.id))
      showToast('Équipement supprimé.')
    } catch { showToast('Erreur lors de la suppression.') }
    finally { setDeleting(null) }
  }

  const handleExport = async () => {
    if (exporting) return
    setExporting(true)
    try { await exportInventoryCSV() }
    catch { showToast('Erreur lors de l\'export.') }
    finally { setExporting(false) }
  }

  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2" style={{ borderColor: 'rgba(192,48,46,0.1)', borderTopColor: '#FB3936' }} />
      </div>
    )
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@400;500;600;700;800&display=swap');
        .inv-page { font-family: 'Baloo 2', sans-serif; }
        .inv-card { background: white; border-radius: 20px; box-shadow: 0 2px 12px rgba(192,48,46,0.07); border: 1px solid rgba(192,48,46,0.08); overflow: hidden; }
        .inv-th { padding: 10px 16px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #7F7F7F; white-space: nowrap; text-align: left; }
        .inv-td { padding: 12px 16px; font-size: 13.5px; color: #2C2C2C; border-top: 1px solid rgba(192,48,46,0.05); }
        .inv-tr:hover td { background: rgba(251,57,54,0.025); }
        .inv-label { display: block; margin-bottom: 6px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #7F7F7F; }
        .inv-input { width: 100%; border: 1px solid rgba(192,48,46,0.15); border-radius: 10px; padding: 9px 12px; font-size: 14px; outline: none; font-family: inherit; color: #1A1A1A; transition: border 0.2s; background: white; }
        .inv-input:focus { border-color: #FB3936; box-shadow: 0 0 0 3px rgba(251,57,54,0.1); }
        .inv-select { border: 1px solid rgba(192,48,46,0.15); border-radius: 10px; padding: 8px 28px 8px 12px; font-size: 13.5px; outline: none; font-family: inherit; background: white; cursor: pointer; appearance: none; color: #2C2C2C; transition: border 0.2s; }
        .inv-select:focus { border-color: #FB3936; }
        .inv-btn-primary { border-radius: 12px; padding: 9px 20px; font-size: 13.5px; font-weight: 700; color: white; background: linear-gradient(135deg, #FB3936 0%, #D42F2D 100%); box-shadow: 0 2px 8px rgba(251,57,54,0.3); border: none; cursor: pointer; transition: opacity 0.15s; }
        .inv-btn-primary:disabled { opacity: 0.4; cursor: not-allowed; }
        .inv-btn-ghost { border-radius: 12px; padding: 9px 20px; font-size: 13.5px; font-weight: 700; color: #2C2C2C; background: rgba(0,0,0,0.06); border: none; cursor: pointer; }
        .inv-icon-btn { padding: 6px; border-radius: 8px; border: none; cursor: pointer; display: flex; align-items: center; transition: background 0.15s; background: none; }
      `}</style>

      <div className="inv-page min-h-screen pb-24 lg:pb-8" style={{ background: '#F8F8F8' }}>
        <div className="mx-auto max-w-4xl px-5 py-8 space-y-5">

          {/* Header */}
          <div>
            <div className="flex items-center gap-2 mb-1" style={{ color: '#D42F2D' }}>
              <IconBox />
              <h1 className="text-3xl font-extrabold" style={{ letterSpacing: '-0.02em', color: '#C0302E' }}>Inventaire</h1>
            </div>
            <p className="text-sm" style={{ color: '#7F7F7F' }}>Gérez le matériel de l&apos;association</p>
          </div>

          {/* Compteurs */}
          <div className="grid grid-cols-3 gap-3">
            {([['good','Bon état'],['worn','Usé'],['broken','Hors service']] as [EquipmentStatus, string][]).map(([s, label]) => (
              <div key={s} className="inv-card" style={{ padding: '16px 20px' }}>
                <p className="text-2xl font-extrabold" style={{ color: STATUS_CONFIG[s].color, lineHeight: 1 }}>{counts[s]}</p>
                <p className="text-xs mt-1" style={{ color: '#7F7F7F' }}>{label}</p>
              </div>
            ))}
          </div>

          {/* Tableau */}
          <div className="inv-card">
            {/* Toolbar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', borderBottom: '1px solid rgba(192,48,46,0.07)', flexWrap: 'wrap' }}>
              {/* Filtres */}
              <div className="relative">
                <select className="inv-select" value={filterCat} onChange={e => setFilterCat(e.target.value)}>
                  <option value="">Toutes catégories</option>
                  {(Object.entries(CATEGORY_LABELS) as [EquipmentCategory, string][]).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
              <div className="relative">
                <select className="inv-select" value={filterStat} onChange={e => setFilterStat(e.target.value)}>
                  <option value="">Tous états</option>
                  {(Object.entries(STATUS_CONFIG) as [EquipmentStatus, { label: string }][]).map(([v, { label }]) => <option key={v} value={v}>{label}</option>)}
                </select>
              </div>

              <div style={{ flex: 1 }} />

              {/* Actions */}
              <button onClick={handleExport} disabled={exporting || items.length === 0}
                className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-bold transition disabled:opacity-40"
                style={{ background: 'rgba(192,48,46,0.08)', color: '#C0302E', border: '1px solid rgba(192,48,46,0.15)' }}>
                <IconDownload />{exporting ? 'Export…' : 'Exporter CSV'}
              </button>
              <button onClick={() => { setEditing(null); setShowForm(true) }}
                className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-bold text-white"
                style={{ background: 'linear-gradient(135deg, #FB3936 0%, #D42F2D 100%)', boxShadow: '0 2px 8px rgba(251,57,54,0.3)' }}>
                <IconPlus /> Ajouter
              </button>
            </div>

            {/* Table */}
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-14 text-center">
                <div style={{ opacity: 0.2, color: '#D42F2D' }}><IconBox /></div>
                <p className="text-sm" style={{ color: '#7F7F7F' }}>
                  {filterCat || filterStat ? 'Aucun équipement pour ces filtres.' : 'Aucun équipement ajouté.'}
                </p>
                {!filterCat && !filterStat && (
                  <button onClick={() => setShowForm(true)} className="text-xs font-semibold hover:underline" style={{ color: '#FB3936' }}>
                    Ajouter le premier →
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: 'rgba(251,57,54,0.02)' }}>
                      <th className="inv-th">Nom</th>
                      <th className="inv-th">Catégorie</th>
                      <th className="inv-th">Qté</th>
                      <th className="inv-th">Dispo</th>
                      <th className="inv-th">État</th>
                      <th className="inv-th" style={{ width: '80px' }} />
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(item => {
                      const sc = STATUS_CONFIG[item.status]
                      return (
                        <tr key={item.id} className="inv-tr" style={{ cursor: 'pointer' }} onClick={() => router.push(`/tableau-de-bord/inventaire/${item.id}`)}>
                          <td className="inv-td font-semibold">{item.name}</td>
                          <td className="inv-td" style={{ color: '#7F7F7F' }}>{CATEGORY_LABELS[item.category]}</td>
                          <td className="inv-td">{item.quantity}</td>
                          <td className="inv-td">
                            <span style={{ fontWeight: 600, color: item.available_count > 0 ? '#059669' : '#D42F2D' }}>
                              {item.available_count}
                            </span>
                          </td>
                          <td className="inv-td">
                            <span className="rounded-full px-2.5 py-0.5 text-xs font-bold" style={{ background: sc.bg, color: sc.color }}>
                              {sc.label}
                            </span>
                          </td>
                          <td className="inv-td">
                            <div className="flex items-center gap-1">
                              <button className="inv-icon-btn" title="Modifier"
                                onClick={(e) => { e.stopPropagation(); setEditing(item); setShowForm(true) }}
                                style={{ color: '#7F7F7F' }}
                                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(192,48,46,0.08)')}
                                onMouseLeave={e => (e.currentTarget.style.background = 'none')}>
                                <IconEdit />
                              </button>
                              {canDelete && (
                                <button className="inv-icon-btn" title="Supprimer"
                                  onClick={(e) => { e.stopPropagation(); setDeleting(item) }}
                                  style={{ color: '#7F7F7F' }}
                                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(251,57,54,0.08)')}
                                  onMouseLeave={e => (e.currentTarget.style.background = 'none')}>
                                  <IconTrash />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
                <div className="px-5 py-3 text-xs" style={{ color: '#7F7F7F', borderTop: '1px solid rgba(192,48,46,0.05)' }}>
                  {filtered.length} équipement{filtered.length !== 1 ? 's' : ''}
                  {(filterCat || filterStat) && ` filtrés sur ${items.length}`}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal formulaire */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '20px', padding: '32px', maxWidth: '480px', width: '100%', boxShadow: '0 8px 40px rgba(0,0,0,0.16)', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1A1A1A', marginBottom: '20px' }}>
              {editing ? 'Modifier l\'équipement' : 'Ajouter un équipement'}
            </h3>
            <EquipmentForm initial={editing ?? undefined} onSave={handleSaved} onCancel={() => { setShowForm(false); setEditing(null) }} />
          </div>
        </div>
      )}

      {/* Modal confirmation suppression */}
      {deleting && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '20px', padding: '32px', maxWidth: '400px', width: '100%', boxShadow: '0 8px 40px rgba(0,0,0,0.16)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1A1A1A', marginBottom: '10px' }}>Supprimer l&apos;équipement ?</h3>
            <p style={{ fontSize: '14px', color: '#7F7F7F', marginBottom: '24px' }}>
              <strong style={{ color: '#1A1A1A' }}>{deleting.name}</strong> sera supprimé définitivement.
            </p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleting(null)} className="inv-btn-ghost">Annuler</button>
              <button onClick={handleDelete} className="rounded-xl px-5 py-2.5 text-sm font-bold text-white" style={{ background: '#D42F2D', border: 'none', cursor: 'pointer' }}>Supprimer</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 999, padding: '12px 18px', borderRadius: '12px', background: 'white', border: '1px solid rgba(251,57,54,0.2)', fontSize: '14px', fontWeight: 500, fontFamily: "'Baloo 2', sans-serif", boxShadow: '0 4px 16px rgba(0,0,0,0.1)', color: '#1A1A1A' }}>
          {toast}
        </div>
      )}
    </>
  )
}
