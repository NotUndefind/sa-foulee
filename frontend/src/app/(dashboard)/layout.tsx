'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth.store'
import { useRole } from '@/hooks/useRole'
import { logout } from '@/lib/auth'
import { ToastProvider } from '@/components/ui/Toast'

// ─── SVG Icons ────────────────────────────────────────────────────────────────

function IconHome({ active }: { active?: boolean }) {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.6} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9.5z" />
      <path d="M9 21V12h6v9" />
    </svg>
  )
}

function IconCalendar({ active }: { active?: boolean }) {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.6} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
      <circle cx="8" cy="15" r="1" fill="currentColor" />
      <circle cx="12" cy="15" r="1" fill="currentColor" />
      <circle cx="16" cy="15" r="1" fill="currentColor" />
    </svg>
  )
}

function IconRun({ active }: { active?: boolean }) {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.6} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="15" cy="4" r="2" />
      <path d="M10.5 8.5L8 17l4-2 3 4 2-8" />
      <path d="M16 8l-2.5.5-3 5" />
      <path d="M5 12l3.5 1" />
    </svg>
  )
}

function IconPen({ active }: { active?: boolean }) {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.6} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
    </svg>
  )
}

function IconTrophy({ active }: { active?: boolean }) {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.6} strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 21h8M12 17v4" />
      <path d="M7 4H4v3a5 5 0 0 0 5 5h6a5 5 0 0 0 5-5V4h-3" />
      <path d="M7 4h10" />
      <path d="M4 7H2M20 7h2" />
    </svg>
  )
}

function IconUser({ active }: { active?: boolean }) {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.6} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  )
}

function IconBox({ active }: { active?: boolean }) {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.6} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
      <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
      <line x1="12" y1="22.08" x2="12" y2="12"/>
    </svg>
  )
}

function IconMail({ active }: { active?: boolean }) {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.6} strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2"/>
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
    </svg>
  )
}

function IconSettings({ active }: { active?: boolean }) {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.6} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  )
}

function IconLogout() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  )
}

// ─── Nav Config ───────────────────────────────────────────────────────────────

type NavItem = {
  href: string
  label: string
  Icon: React.ComponentType<{ active?: boolean }>
}

const NAV_LINKS: NavItem[] = [
  { href: '/tableau-de-bord',             label: 'Accueil',     Icon: IconHome },
  { href: '/tableau-de-bord/evenements',  label: 'Événements',  Icon: IconCalendar },
  { href: '/tableau-de-bord/sessions',    label: 'Sessions',    Icon: IconRun },
  { href: '/tableau-de-bord/blog',        label: 'Blog',        Icon: IconPen },
  { href: '/tableau-de-bord/leaderboard', label: 'Classement',  Icon: IconTrophy },
  { href: '/tableau-de-bord/profil',      label: 'Mon profil',  Icon: IconUser },
]

// ─── Role helper ──────────────────────────────────────────────────────────────

function getRoleLabel(roles?: string[]): string {
  if (!roles?.length) return 'Membre'
  if (roles.includes('admin'))   return 'Administrateur'
  if (roles.includes('founder')) return 'Fondateur'
  if (roles.includes('coach'))   return 'Coach'
  if (roles.includes('bureau'))  return 'Bureau'
  return 'Membre'
}

// ─── Layout ───────────────────────────────────────────────────────────────────

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname           = usePathname()
  const router             = useRouter()
  const { user }           = useAuthStore()
  const { canManageUsers, canManageEvents } = useRole()

  const handleLogout = async () => {
    await logout()
    useAuthStore.getState().logout()
    router.push('/connexion')
  }

  const initials = [user?.first_name?.[0], user?.last_name?.[0]].filter(Boolean).join('').toUpperCase()

  return (
    <ToastProvider>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@400;500;600;700;800&display=swap');

        .sf-layout { font-family: 'Baloo 2', sans-serif; }

        /* Sidebar nav links */
        .sf-nav-link {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 9px 14px;
          border-radius: 10px;
          font-size: 13.5px;
          font-weight: 500;
          text-decoration: none;
          transition: background 0.15s ease, color 0.15s ease;
          color: rgba(255,255,255,0.55);
          position: relative;
        }
        .sf-nav-link:hover {
          background: rgba(255,255,255,0.07);
          color: rgba(255,255,255,0.9);
        }
        .sf-nav-link.active {
          background: rgba(251,57,54,0.25);
          color: #ffffff;
          font-weight: 600;
        }
        .sf-nav-link.active::before {
          content: '';
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 3px;
          height: 55%;
          background: #FB3936;
          border-radius: 0 3px 3px 0;
        }

        /* Mobile bottom nav */
        .sf-mobile-nav { font-family: 'Baloo 2', sans-serif; }
        .sf-mobile-link {
          display: flex;
          flex: 1;
          flex-direction: column;
          align-items: center;
          gap: 3px;
          padding: 8px 4px 6px;
          font-size: 10px;
          font-weight: 500;
          text-decoration: none;
          transition: color 0.15s ease;
          color: #a1a1aa;
          position: relative;
        }
        .sf-mobile-link.active {
          color: #FB3936;
          font-weight: 700;
        }
        .sf-mobile-dot {
          position: absolute;
          top: 5px;
          left: 50%;
          transform: translateX(-50%);
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: #FB3936;
        }

        /* Avatar ring */
        .sf-avatar {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: rgba(251,57,54,0.25);
          border: 1.5px solid rgba(251,57,54,0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          font-weight: 700;
          color: #F4C4C0;
          flex-shrink: 0;
        }
      `}</style>

      <div className="sf-layout flex min-h-screen bg-sf-cream-soft">

        {/* ── Desktop Sidebar ──────────────────────────────────────── */}
        <aside
          className="hidden lg:flex w-56 shrink-0 flex-col"
          style={{
            background: '#C0302E',
            borderRight: '1px solid rgba(192,48,46,0.06)',
          }}
        >
          {/* Logo */}
          <Link
            href="/"
            style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: '0.1em',
              padding: '20px 18px 18px',
              textDecoration: 'none',
              borderBottom: '1px solid rgba(255,255,255,0.07)',
            }}
          >
            <span style={{ fontSize: '1rem', fontWeight: 400, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.04em' }}>sa </span>
            <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#F4C4C0', letterSpacing: '-0.01em' }}>Foulée</span>
          </Link>

          {/* Navigation */}
          <nav style={{ flex: 1, overflowY: 'auto', padding: '16px 10px' }}>
            <p style={{
              fontSize: '9.5px',
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.25)',
              padding: '0 6px',
              marginBottom: '6px',
            }}>
              Menu
            </p>

            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {NAV_LINKS.map(({ href, label, Icon }) => {
                const active = pathname === href || (href !== '/tableau-de-bord' && pathname.startsWith(href))
                return (
                  <li key={href}>
                    <Link href={href} className={`sf-nav-link${active ? ' active' : ''}`}>
                      <span style={{ opacity: active ? 1 : 0.7, flexShrink: 0 }}>
                        <Icon active={active} />
                      </span>
                      {label}
                    </Link>
                  </li>
                )
              })}

              {(canManageUsers || canManageEvents) && (
                <>
                  <li style={{ paddingTop: '14px' }}>
                    <p style={{
                      fontSize: '9.5px',
                      fontWeight: 700,
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      color: 'rgba(255,255,255,0.25)',
                      padding: '0 6px',
                      marginBottom: '6px',
                    }}>
                      Gestion
                    </p>
                  </li>
                  {canManageEvents && (
                    <li>
                      <Link
                        href="/tableau-de-bord/inventaire"
                        className={`sf-nav-link${pathname.startsWith('/tableau-de-bord/inventaire') ? ' active' : ''}`}
                      >
                        <span style={{ opacity: pathname.startsWith('/tableau-de-bord/inventaire') ? 1 : 0.7, flexShrink: 0 }}>
                          <IconBox active={pathname.startsWith('/tableau-de-bord/inventaire')} />
                        </span>
                        Inventaire
                      </Link>
                    </li>
                  )}
                  <li>
                    <Link
                      href="/tableau-de-bord/admin"
                      className={`sf-nav-link${pathname.startsWith('/tableau-de-bord/admin') ? ' active' : ''}`}
                    >
                      <span style={{ opacity: pathname.startsWith('/tableau-de-bord/admin') ? 1 : 0.7, flexShrink: 0 }}>
                        <IconSettings active={pathname.startsWith('/tableau-de-bord/admin')} />
                      </span>
                      Administration
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/tableau-de-bord/newsletter"
                      className={`sf-nav-link${pathname.startsWith('/tableau-de-bord/newsletter') ? ' active' : ''}`}
                    >
                      <span style={{ opacity: pathname.startsWith('/tableau-de-bord/newsletter') ? 1 : 0.7, flexShrink: 0 }}>
                        <IconMail active={pathname.startsWith('/tableau-de-bord/newsletter')} />
                      </span>
                      Newsletter
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </nav>

          {/* User section */}
          <div style={{
            padding: '12px 10px',
            borderTop: '1px solid rgba(255,255,255,0.07)',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '8px 10px',
              borderRadius: '10px',
            }}>
              <div className="sf-avatar">{initials || '?'}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                  fontSize: '12.5px',
                  fontWeight: 600,
                  color: 'rgba(255,255,255,0.9)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  lineHeight: 1.2,
                  margin: 0,
                }}>
                  {user?.first_name} {user?.last_name}
                </p>
                <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', margin: 0, marginTop: '1px' }}>
                  {getRoleLabel(user?.roles)}
                </p>
              </div>
              <button
                onClick={handleLogout}
                title="Se déconnecter"
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '6px',
                  borderRadius: '7px',
                  color: 'rgba(255,255,255,0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'background 0.15s ease, color 0.15s ease',
                  flexShrink: 0,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(251,57,54,0.2)'; e.currentTarget.style.color = '#F4C4C0' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'rgba(255,255,255,0.25)' }}
              >
                <IconLogout />
              </button>
            </div>
          </div>
        </aside>

        {/* ── Main Content ──────────────────────────────────────────── */}
        <main className="flex-1 overflow-y-auto">{children}</main>

        {/* ── Mobile Bottom Nav ─────────────────────────────────────── */}
        <nav
          className="sf-mobile-nav fixed bottom-0 left-0 right-0 z-40 flex lg:hidden bg-white"
          style={{
            borderTop: '1px solid #ececec',
            boxShadow: '0 -1px 16px rgba(0,0,0,0.05)',
            paddingBottom: 'env(safe-area-inset-bottom)',
          }}
        >
          {NAV_LINKS.slice(0, 5).map(({ href, label, Icon }) => {
            const active = pathname === href || (href !== '/tableau-de-bord' && pathname.startsWith(href))
            return (
              <Link key={href} href={href} className={`sf-mobile-link${active ? ' active' : ''}`}>
                {active && <span className="sf-mobile-dot" />}
                <span style={{ marginTop: active ? '4px' : '0' }}>
                  <Icon active={active} />
                </span>
                <span>{label.split(' ')[0]}</span>
              </Link>
            )
          })}
        </nav>
      </div>
    </ToastProvider>
  )
}
