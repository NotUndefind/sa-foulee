import Link from 'next/link'
import PublicNavUser from '@/components/features/public/PublicNavUser'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen" style={{ background: '#F4EFE6' }}>
      <style>{`
        .sF-nav-link {
          font-size: 0.875rem;
          font-weight: 500;
          color: #2E4A20;
          text-decoration: none;
          opacity: 0.75;
          transition: opacity 0.15s ease;
        }
        .sF-nav-link:hover { opacity: 1; }
      `}</style>

      {/* ── Navbar ────────────────────────────────────────────────── */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        background: 'rgba(244,239,230,0.82)',
        borderBottom: '1px solid rgba(30,58,20,0.08)',
      }}>
        <div style={{
          maxWidth: '1040px',
          margin: '0 auto',
          padding: '0 1.5rem',
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontFamily: "'Baloo 2', sans-serif",
        }}>
          {/* Logo */}
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'baseline', gap: '0.15em' }}>
            <span style={{ fontSize: '1.25rem', fontWeight: 400, color: '#3A6B2A', letterSpacing: '0.04em' }}>
              sa{' '}
            </span>
            <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#D05918', letterSpacing: '-0.01em' }}>
              Foulée
            </span>
          </Link>

          {/* Right side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <nav style={{ display: 'flex', alignItems: 'center', gap: '1.75rem' }}>
              <Link href="/activites" className="sF-nav-link">Activités</Link>
              <Link href="/blog" className="sF-nav-link">Blog</Link>
            </nav>
            <PublicNavUser />
          </div>
        </div>
      </header>

      <main>{children}</main>
    </div>
  )
}
