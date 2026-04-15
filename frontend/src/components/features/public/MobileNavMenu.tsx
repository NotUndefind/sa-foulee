'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth.store'
import { logout } from '@/lib/auth'

export default function MobileNavMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { user } = useAuthStore()

  // Fermer le drawer à chaque changement de route
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  // Bloquer le scroll du body quand le drawer est ouvert
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const handleLogout = async () => {
    await logout()
    useAuthStore.getState().logout()
    setIsOpen(false)
    router.refresh()
  }

  return (
    <>
      {/* Bouton hamburger — mobile uniquement */}
      <button
        className="md:hidden"
        onClick={() => setIsOpen(true)}
        aria-label="Ouvrir le menu"
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#5A1510',
          borderRadius: '8px',
          minWidth: '44px',
          minHeight: '44px',
          fontFamily: "'Baloo 2', sans-serif",
        }}
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      {/* Overlay sombre */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 200,
            background: 'rgba(0,0,0,0.4)',
            backdropFilter: 'blur(2px)',
            WebkitBackdropFilter: 'blur(2px)',
          }}
        />
      )}

      {/* Drawer — glisse depuis la droite */}
      <div
        aria-hidden={!isOpen}
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: 'min(300px, 90vw)',
          zIndex: 201,
          background: '#FAFAFA',
          boxShadow: '-4px 0 32px rgba(0,0,0,0.15)',
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
          display: 'flex',
          flexDirection: 'column',
          fontFamily: "'Baloo 2', sans-serif",
          paddingTop: 'env(safe-area-inset-top)',
          paddingBottom: 'env(safe-area-inset-bottom)',
          overflowY: 'auto',
        }}
      >
        {/* En-tête du drawer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 16px',
            height: '64px',
            borderBottom: '1px solid rgba(251,57,54,0.1)',
            flexShrink: 0,
          }}
        >
          <span
            style={{
              fontSize: '1rem',
              fontWeight: 700,
              color: '#FB3936',
              lineHeight: 1.2,
            }}
          >
            La Neuville TAF
            <br />
            <span style={{ fontWeight: 800 }}>sa Foulée</span>
          </span>
          <button
            onClick={() => setIsOpen(false)}
            aria-label="Fermer le menu"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#5A1510',
              borderRadius: '8px',
              minWidth: '44px',
              minHeight: '44px',
              opacity: 0.6,
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Liens de navigation */}
        <nav
          style={{
            padding: '12px 8px',
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
          }}
        >
          {[
            { href: '/activites', label: 'Activités' },
            { href: '/blog', label: 'Blog' },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setIsOpen(false)}
              style={{
                display: 'block',
                padding: '12px 16px',
                borderRadius: '10px',
                fontSize: '1rem',
                fontWeight: 600,
                color: '#1A1A1A',
                textDecoration: 'none',
              }}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Séparateur */}
        <div
          style={{
            height: '1px',
            background: 'rgba(251,57,54,0.1)',
            margin: '4px 16px',
            flexShrink: 0,
          }}
        />

        {/* Section auth */}
        <div
          style={{
            padding: '16px 8px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          {user ? (
            <>
              {/* Identité utilisateur */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '8px 16px 12px',
                }}
              >
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: 'rgba(192,48,46,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: '#C0302E',
                    flexShrink: 0,
                  }}
                >
                  {user.first_name?.[0]}
                  {user.last_name?.[0]}
                </div>
                <span
                  style={{
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: '#1A1A1A',
                    lineHeight: 1.3,
                  }}
                >
                  {user.first_name} {user.last_name}
                </span>
              </div>
              <Link
                href="/tableau-de-bord"
                onClick={() => setIsOpen(false)}
                style={{
                  display: 'block',
                  padding: '13px 16px',
                  borderRadius: '100px',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  color: '#C0302E',
                  textDecoration: 'none',
                  border: '1.5px solid rgba(192,48,46,0.25)',
                  textAlign: 'center',
                  minHeight: '44px',
                }}
              >
                Tableau de bord
              </Link>
              <button
                onClick={handleLogout}
                style={{
                  padding: '12px 16px',
                  borderRadius: '100px',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  color: '#7F7F7F',
                  background: 'none',
                  border: '1px solid rgba(0,0,0,0.1)',
                  cursor: 'pointer',
                  width: '100%',
                  minHeight: '44px',
                }}
              >
                Se déconnecter
              </button>
            </>
          ) : (
            <>
              <Link
                href="/connexion"
                onClick={() => setIsOpen(false)}
                style={{
                  display: 'block',
                  padding: '13px 16px',
                  borderRadius: '100px',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  color: 'white',
                  background: '#FB3936',
                  textDecoration: 'none',
                  textAlign: 'center',
                  boxShadow: '0 2px 12px rgba(251,57,54,0.3)',
                  minHeight: '44px',
                }}
              >
                Connexion
              </Link>
              <Link
                href="/inscription"
                onClick={() => setIsOpen(false)}
                style={{
                  display: 'block',
                  padding: '13px 16px',
                  borderRadius: '100px',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  color: '#5A1510',
                  textDecoration: 'none',
                  textAlign: 'center',
                  border: '1.5px solid rgba(90,21,16,0.2)',
                  minHeight: '44px',
                }}
              >
                Rejoindre
              </Link>
            </>
          )}
        </div>
      </div>
    </>
  )
}
