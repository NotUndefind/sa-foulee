import Image from 'next/image'
import Link from 'next/link'

const FOOTER_LINKS = [
  { href: '/activites', label: 'Activités' },
  { href: '/blog', label: 'Blog' },
  { href: '/inscription', label: 'Inscription' },
  { href: '/connexion', label: 'Connexion' },
]

export default function LandingFooter() {
  return (
    <footer
      style={{
        background: '#1A1A1A',
        padding: '3.5rem 1.5rem 2rem',
        color: 'rgba(255,255,255,0.45)',
      }}
    >
      <div style={{ maxWidth: '1040px', margin: '0 auto' }}>
        {/* Desktop : brand + liens côte à côte */}
        <div
          className="hidden md:flex"
          style={{
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '2rem',
            marginBottom: '2.5rem',
          }}
        >
          <FooterBrand />
          <nav style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
            {FOOTER_LINKS.map((l) => (
              <Link key={l.href} href={l.href} className="sF-flink">
                {l.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Mobile : brand centré + liens en colonne */}
        <div className="md:hidden" style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <FooterBrand />
          </div>
          <nav
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.875rem',
            }}
          >
            {FOOTER_LINKS.map((l) => (
              <Link key={l.href} href={l.href} className="sF-flink">
                {l.label}
              </Link>
            ))}
          </nav>
        </div>

        <div
          style={{
            borderTop: '1px solid rgba(255,255,255,0.07)',
            paddingTop: '1.75rem',
            textAlign: 'center',
            fontSize: '0.78rem',
          }}
        >
          © {new Date().getFullYear()} La Neuville TAF sa Foulée — Tous droits réservés
        </div>
      </div>
    </footer>
  )
}

function FooterBrand() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
      <Image
        src="/logo-removebg-preview.png"
        alt="La Neuville TAF sa Foulée"
        width={44}
        height={44}
        style={{
          objectFit: 'contain',
          filter: 'brightness(0) invert(1)',
          opacity: 0.9,
          width: 'auto',
          height: 'auto',
        }}
      />
      <div>
        <div
          style={{
            fontSize: '1rem',
            fontWeight: 800,
            color: '#FAFAFA',
            marginBottom: '0.15rem',
            lineHeight: 1.2,
          }}
        >
          La Neuville TAF sa Foulée
        </div>
        <p style={{ fontSize: '0.75rem' }}>Association de course à pied</p>
      </div>
    </div>
  )
}
