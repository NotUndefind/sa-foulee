'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { assignEquipment } from '@/lib/inventory'
import type { EquipmentAssignment } from '@/types'

interface Member { id: number; first_name: string; last_name: string; email: string }

interface Props {
  equipmentId: number
  equipmentName: string
  onAssigned: (assignment: EquipmentAssignment) => void
  onCancel: () => void
}

export default function AssignmentModal({ equipmentId, equipmentName, onAssigned, onCancel }: Props) {
  const [members,  setMembers]  = useState<Member[]>([])
  const [search,   setSearch]   = useState('')
  const [selected, setSelected] = useState<Member | null>(null)
  const [notes,    setNotes]    = useState('')
  const [saving,   setSaving]   = useState(false)
  const [error,    setError]    = useState<string | null>(null)

  useEffect(() => {
    api.get<Member[]>('/members').then(setMembers).catch(() => {})
  }, [])

  const filtered = members.filter(m => {
    const q = search.toLowerCase()
    return `${m.first_name} ${m.last_name} ${m.email}`.toLowerCase().includes(q)
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selected) { setError('Sélectionne un membre.'); return }
    setSaving(true); setError(null)
    try {
      const res = await assignEquipment(equipmentId, { user_id: selected.id, notes: notes || undefined }) as EquipmentAssignment
      onAssigned(res)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erreur lors de l\'attribution.'
      setError(msg)
    } finally { setSaving(false) }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ background: 'white', borderRadius: '20px', padding: '32px', maxWidth: '460px', width: '100%', boxShadow: '0 8px 40px rgba(0,0,0,0.16)', fontFamily: "'Baloo 2', sans-serif", maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1A1A1A', marginBottom: '4px' }}>Attribuer l&apos;équipement</h3>
        <p style={{ fontSize: '13px', color: '#7F7F7F', marginBottom: '20px' }}>{equipmentName}</p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1, minHeight: 0 }}>
          {error && (
            <div style={{ padding: '10px 14px', borderRadius: '10px', background: 'rgba(251,57,54,0.06)', border: '1px solid rgba(251,57,54,0.2)', color: '#D42F2D', fontSize: '13px' }}>
              {error}
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#7F7F7F', marginBottom: '6px' }}>Membre *</label>
            <input
              placeholder="Rechercher un membre…"
              value={search}
              onChange={e => { setSearch(e.target.value); setSelected(null) }}
              style={{ width: '100%', border: '1px solid rgba(192,48,46,0.15)', borderRadius: '10px', padding: '9px 12px', fontSize: '14px', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
            />
            {search && !selected && (
              <div style={{ border: '1px solid rgba(192,48,46,0.12)', borderRadius: '10px', marginTop: '4px', overflow: 'hidden', maxHeight: '180px', overflowY: 'auto' }}>
                {filtered.length === 0 ? (
                  <p style={{ padding: '12px 14px', fontSize: '13px', color: '#7F7F7F' }}>Aucun résultat.</p>
                ) : filtered.slice(0, 8).map(m => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => { setSelected(m); setSearch(`${m.first_name} ${m.last_name}`) }}
                    style={{ display: 'block', width: '100%', textAlign: 'left', padding: '10px 14px', border: 'none', background: 'none', cursor: 'pointer', fontFamily: 'inherit', borderBottom: '1px solid rgba(192,48,46,0.05)' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(251,57,54,0.04)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                  >
                    <p style={{ fontSize: '13.5px', fontWeight: 600, color: '#1A1A1A', margin: 0 }}>{m.first_name} {m.last_name}</p>
                    <p style={{ fontSize: '12px', color: '#7F7F7F', margin: 0 }}>{m.email}</p>
                  </button>
                ))}
              </div>
            )}
            {selected && (
              <p style={{ fontSize: '12px', color: '#059669', marginTop: '4px', fontWeight: 600 }}>✓ {selected.first_name} {selected.last_name}</p>
            )}
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#7F7F7F', marginBottom: '6px' }}>Notes <span style={{ color: '#7F7F7F', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>— optionnel</span></label>
            <textarea
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Ex : Taille L, prêt pour la course du 12 mai…"
              style={{ width: '100%', border: '1px solid rgba(192,48,46,0.15)', borderRadius: '10px', padding: '9px 12px', fontSize: '14px', outline: 'none', fontFamily: 'inherit', resize: 'none', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: 'auto' }}>
            <button type="button" onClick={onCancel} style={{ borderRadius: '12px', padding: '9px 20px', fontSize: '13.5px', fontWeight: 700, color: '#2C2C2C', background: 'rgba(0,0,0,0.06)', border: 'none', cursor: 'pointer' }}>
              Annuler
            </button>
            <button type="submit" disabled={saving || !selected} style={{ borderRadius: '12px', padding: '9px 20px', fontSize: '13.5px', fontWeight: 700, color: 'white', background: 'linear-gradient(135deg, #FB3936 0%, #D42F2D 100%)', boxShadow: '0 2px 8px rgba(251,57,54,0.3)', border: 'none', cursor: 'pointer', opacity: (saving || !selected) ? 0.4 : 1 }}>
              {saving ? 'Attribution…' : 'Attribuer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
