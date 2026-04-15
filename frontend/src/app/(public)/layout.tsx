import Link from 'next/link'
import Image from 'next/image'
import PublicNavUser from '@/components/features/public/PublicNavUser'
import MobileNavMenu from '@/components/features/public/MobileNavMenu'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen" style={{ background: '#FAFAFA' }}>
      <style>{`
        .sF-nav-link {
          font-size: 0.875rem;
          font-weight: 500;
          color: #5A1510;
          text-decoration: none;
          opacity: 0.75;
          transition: opacity 0.15s ease;
        }
        .sF-nav-link:hover { opacity: 1; }
      `}</style>

      {/* ── Navbar ────────────────────────────────────────────────── */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          background: 'rgba(250,250,250,0.9)',
          borderBottom: '1px solid rgba(251,57,54,0.1)',
        }}
      >
        <div
          style={{
            maxWidth: '1040px',
            margin: '0 auto',
            padding: '0 1.5rem',
            height: '64px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontFamily: "'Baloo 2', sans-serif",
          }}
        >
          {/* Logo */}
          <Link
            href="/"
            style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.6rem' }}
          >
            <Image
              src="/logo-removebg-preview.png"
              alt="La Neuville TAF sa Foulée"
              width={40}
              height={40}
              priority
              style={{ objectFit: 'contain' }}
            />
            <span
              style={{
                fontSize: '1rem',
                fontWeight: 700,
                color: '#FB3936',
                letterSpacing: '-0.01em',
                lineHeight: 1.2,
              }}
            >
              La Neuville TAF
              <br />
              <span style={{ fontWeight: 800 }}>sa Foulée</span>
            </span>
          </Link>

          {/* Right side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            {/* Desktop : liens nav + auth (masqués sur mobile) */}
            <nav
              className="hidden md:flex items-center"
              style={{ gap: '1.75rem' }}
            >
              <Link href="/activites" className="sF-nav-link">
                Activités
              </Link>
              <Link href="/blog" className="sF-nav-link">
                Blog
              </Link>
            </nav>
            <div className="hidden md:flex items-center">
              <PublicNavUser />
            </div>
            {/* Mobile : hamburger + drawer */}
            <MobileNavMenu />
          </div>
        </div>
      </header>

      <main>{children}</main>
    </div>
  )
}
