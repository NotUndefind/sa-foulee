'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth.store'
import { logout } from '@/lib/auth'

export default function PublicNavUser() {
  const { user } = useAuthStore()
  const router = useRouter()

  const handleLogout = async () => {
    await logout()
    useAuthStore.getState().logout()
    router.refresh()
  }

  if (user) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontFamily: "'Baloo 2', sans-serif" }}>
        <Link href="/tableau-de-bord" style={{
          fontSize: '0.875rem',
          fontWeight: 600,
          color: '#1E3A14',
          textDecoration: 'none',
          padding: '0.45rem 1.1rem',
          borderRadius: '100px',
          border: '1.5px solid rgba(30,58,20,0.22)',
          transition: 'all 0.15s ease',
          whiteSpace: 'nowrap',
        }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(30,58,20,0.06)'; e.currentTarget.style.borderColor = 'rgba(30,58,20,0.4)' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(30,58,20,0.22)' }}
        >
          Tableau de bord
        </Link>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}>
          <div style={{
            width: '30px',
            height: '30px',
            borderRadius: '50%',
            background: 'rgba(30,58,20,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.7rem',
            fontWeight: 700,
            color: '#1E3A14',
          }}>
            {user.first_name?.[0]}{user.last_name?.[0]}
          </div>
        </div>
        <button
          onClick={handleLogout}
          title="Se déconnecter"
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '0.25rem',
            color: 'rgba(30,58,20,0.35)',
            display: 'flex',
            alignItems: 'center',
            transition: 'color 0.15s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#D05918')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(30,58,20,0.35)')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </button>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontFamily: "'Baloo 2', sans-serif" }}>
      <Link href="/inscription" style={{
        fontSize: '0.875rem',
        fontWeight: 500,
        color: '#2E4A20',
        textDecoration: 'none',
        opacity: 0.75,
        transition: 'opacity 0.15s ease',
      }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.75')}
      >
        Rejoindre
      </Link>
      <Link href="/connexion" style={{
        fontSize: '0.875rem',
        fontWeight: 700,
        color: 'white',
        textDecoration: 'none',
        background: '#D05918',
        padding: '0.45rem 1.25rem',
        borderRadius: '100px',
        transition: 'all 0.15s ease',
        boxShadow: '0 2px 12px rgba(208,89,24,0.3)',
        whiteSpace: 'nowrap',
      }}
        onMouseEnter={(e) => { e.currentTarget.style.background = '#BB4E14'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(208,89,24,0.4)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
        onMouseLeave={(e) => { e.currentTarget.style.background = '#D05918'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(208,89,24,0.3)'; e.currentTarget.style.transform = 'translateY(0)' }}
      >
        Connexion
      </Link>
    </div>
  )
}
