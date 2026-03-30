'use client'

import { useEffect, useState } from 'react'
import { useRole } from '@/hooks/useRole'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'

interface Subscriber {
  id: number
  first_name: string
  last_name: string
  email: string
  newsletter_subscribed_at: string
}

interface SubscribersResponse {
  total: number
  subscribers: Subscriber[]
}

function IconMail() {
  return (
    <svg width={26} height={26} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2"/>
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
    </svg>
  )
}

function IconDownload() {
  return (
    <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
  )
}

function IconSearch() {
  return (
    <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
    </svg>
  )
}

function IconSort() {
  return (
    <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m3 16 4 4 4-4"/><path d="M7 20V4"/><path d="m21 8-4-4-4 4"/><path d="M17 4v16"/>
    </svg>
  )
}

export default function NewsletterAdminPage() {
  const { canManageUsers } = useRole()
  const router = useRouter()

  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [total,       setTotal]       = useState(0)
  const [loading,     setLoading]     = useState(true)
  const [search,      setSearch]      = useState('')
  const [sortAsc,     setSortAsc]     = useState(false)
  const [exporting,   setExporting]   = useState(false)

  useEffect(() => {
    if (!canManageUsers) {
      router.replace('/tableau-de-bord')
      return
    }
    api.get<SubscribersResponse>('/admin/newsletter/subscribers')
      .then((data) => { setSubscribers(data.subscribers); setTotal(data.total) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [canManageUsers, router])

  const filtered = subscribers
    .filter((s) => {
      const q = search.toLowerCase()
      return (
        s.first_name.toLowerCase().includes(q) ||
        s.last_name.toLowerCase().includes(q)  ||
        s.email.toLowerCase().includes(q)
      )
    })
    .sort((a, b) => {
      const diff = new Date(a.newsletter_subscribed_at).getTime() - new Date(b.newsletter_subscribed_at).getTime()
      return sortAsc ? diff : -diff
    })

  const handleExport = async () => {
    if (exporting) return
    setExporting(true)
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
      const res   = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1'}/admin/newsletter/subscribers/export`,
        { headers: { Authorization: `Bearer ${token}`, Accept: 'text/csv' } }
      )
      if (!res.ok) throw new Error()
      const blob = await res.blob()
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href     = url
      a.download = `newsletter-abonnes-${new Date().toISOString().slice(0, 10)}.csv`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      // silently ignore
    } finally {
      setExporting(false)
    }
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
        .nl-admin { font-family: 'Baloo 2', sans-serif; }
        .nl-card {
          background: white;
          border-radius: 20px;
          box-shadow: 0 2px 12px rgba(192,48,46,0.07);
          border: 1px solid rgba(192,48,46,0.08);
          overflow: hidden;
        }
        .nl-th {
          padding: 10px 16px;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #7F7F7F;
          white-space: nowrap;
        }
        .nl-td {
          padding: 12px 16px;
          font-size: 13.5px;
          color: #2C2C2C;
          border-top: 1px solid rgba(192,48,46,0.05);
        }
        .nl-tr:hover td { background: rgba(251,57,54,0.025); }
        .nl-input {
          border: 1px solid rgba(192,48,46,0.15);
          border-radius: 10px;
          padding: 8px 12px 8px 36px;
          font-size: 13.5px;
          outline: none;
          width: 100%;
          font-family: inherit;
          transition: border 0.2s;
        }
        .nl-input:focus { border-color: #FB3936; box-shadow: 0 0 0 3px rgba(251,57,54,0.1); }
      `}</style>

      <div className="nl-admin min-h-screen pb-24 lg:pb-8" style={{ background: '#F8F8F8' }}>
        <div className="mx-auto max-w-4xl px-5 py-8 space-y-5">

          {/* Header */}
          <div>
            <div className="flex items-center gap-2 mb-1" style={{ color: '#D42F2D' }}>
              <IconMail />
              <h1 className="text-3xl font-extrabold" style={{ letterSpacing: '-0.02em', color: '#C0302E' }}>
                Newsletter
              </h1>
            </div>
            <p className="text-sm" style={{ color: '#7F7F7F' }}>Gérez les abonnés et suivez les envois</p>
          </div>

          {/* Stat card */}
          <div className="nl-card" style={{ padding: '20px 24px' }}>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <p className="text-4xl font-extrabold" style={{ color: '#FB3936', lineHeight: 1 }}>{total}</p>
                <p className="text-sm mt-1" style={{ color: '#7F7F7F' }}>
                  membre{total !== 1 ? 's' : ''} abonné{total !== 1 ? 's' : ''}
                </p>
              </div>
              <button
                onClick={handleExport}
                disabled={exporting || total === 0}
                className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white transition disabled:opacity-40"
                style={{ background: 'linear-gradient(135deg, #FB3936 0%, #D42F2D 100%)', boxShadow: '0 2px 8px rgba(251,57,54,0.3)' }}
              >
                <IconDownload />
                {exporting ? 'Export…' : 'Exporter CSV'}
              </button>
            </div>
          </div>

          {/* Table card */}
          <div className="nl-card">
            {/* Toolbar */}
            <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: '1px solid rgba(192,48,46,0.07)' }}>
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#7F7F7F' }}>
                  <IconSearch />
                </span>
                <input
                  className="nl-input"
                  placeholder="Rechercher par nom ou email…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            {filtered.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-12 text-center">
                <div style={{ opacity: 0.2, color: '#D42F2D' }}><IconMail /></div>
                <p className="text-sm" style={{ color: '#7F7F7F' }}>
                  {search ? 'Aucun résultat pour cette recherche.' : 'Aucun abonné pour l\'instant.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: 'rgba(251,57,54,0.02)' }}>
                      <th className="nl-th" style={{ textAlign: 'left' }}>Prénom</th>
                      <th className="nl-th" style={{ textAlign: 'left' }}>Nom</th>
                      <th className="nl-th" style={{ textAlign: 'left' }}>Email</th>
                      <th className="nl-th" style={{ textAlign: 'left' }}>
                        <button
                          onClick={() => setSortAsc((v) => !v)}
                          className="flex items-center gap-1"
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7F7F7F', font: 'inherit', fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}
                        >
                          Abonné le <IconSort />
                        </button>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((s) => (
                      <tr key={s.id} className="nl-tr">
                        <td className="nl-td">{s.first_name}</td>
                        <td className="nl-td font-semibold">{s.last_name}</td>
                        <td className="nl-td" style={{ color: '#7F7F7F' }}>{s.email}</td>
                        <td className="nl-td" style={{ color: '#7F7F7F', whiteSpace: 'nowrap' }}>
                          {new Date(s.newsletter_subscribed_at).toLocaleDateString('fr-FR', {
                            day: 'numeric', month: 'short', year: 'numeric',
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {filtered.length > 0 && (
              <div className="px-5 py-3 text-xs" style={{ color: '#7F7F7F', borderTop: '1px solid rgba(192,48,46,0.05)' }}>
                {filtered.length} résultat{filtered.length !== 1 ? 's' : ''}
                {search ? ` pour "${search}"` : ''}
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  )
}
