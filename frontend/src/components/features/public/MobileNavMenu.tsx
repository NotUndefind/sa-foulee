'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth.store'
import { logout } from '@/lib/auth'

export default function MobileNavMenu() {
  const { user } = useAuthStore()
  const router = useRouter()

  const handleLogout = async () => {
    await logout()
    useAuthStore.getState().logout()
    router.refresh()
  }

  if (user) {
    return (
      <div className="flex items-center md:hidden" style={{ gap: '0.5rem' }}>
        <Link
          href="/tableau-de-bord"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: 'rgba(192,48,46,0.1)',
            fontSize: '0.7rem',
            fontWeight: 700,
            color: '#C0302E',
            textDecoration: 'none',
            flexShrink: 0,
            fontFamily: "'Baloo 2', sans-serif",
          }}
          aria-label="Tableau de bord"
        >
          {user.first_name?.[0]}
          {user.last_name?.[0]}
        </Link>
        <button
          onClick={handleLogout}
          aria-label="Se déconnecter"
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '0.25rem',
            color: 'rgba(192,48,46,0.35)',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </button>
      </div>
    )
  }

  return (
    <Link
      href="/connexion"
      className="flex items-center md:hidden"
      style={{
        fontSize: '0.875rem',
        fontWeight: 700,
        color: 'white',
        textDecoration: 'none',
        background: '#FB3936',
        padding: '0.45rem 1.1rem',
        borderRadius: '100px',
        boxShadow: '0 2px 12px rgba(251,57,54,0.3)',
        whiteSpace: 'nowrap',
        fontFamily: "'Baloo 2', sans-serif",
        minHeight: '44px',
      }}
    >
      Connexion
    </Link>
  )
}
