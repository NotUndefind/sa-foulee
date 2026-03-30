import Link from 'next/link'
import Image from 'next/image'

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#FAFAFA',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      textAlign: 'center',
      fontFamily: 'system-ui, sans-serif',
    }}>
      <Image
        src="/mascotte-removebg-preview.png"
        alt="Mascotte de La Neuville TAF sa Foulée"
        width={180}
        height={180}
        priority
        style={{ objectFit: 'contain', marginBottom: '2rem', opacity: 0.85 }}
      />

      <p style={{
        fontSize: '0.8rem',
        fontWeight: 700,
        letterSpacing: '0.15em',
        textTransform: 'uppercase',
        color: '#FB3936',
        marginBottom: '0.75rem',
      }}>
        Erreur 404
      </p>

      <h1 style={{
        fontSize: 'clamp(2rem, 6vw, 3.5rem)',
        fontWeight: 800,
        color: '#1A1A1A',
        lineHeight: 1.1,
        marginBottom: '1rem',
      }}>
        Cette page a pris la fuite !
      </h1>

      <p style={{
        color: '#6B7280',
        fontSize: '1rem',
        lineHeight: 1.7,
        maxWidth: '400px',
        marginBottom: '2.5rem',
      }}>
        La page que vous cherchez n&apos;existe pas ou a été déplacée.
        Retournez à l&apos;accueil pour reprendre votre route.
      </p>

      <Link href="/" style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        background: '#FB3936',
        color: '#fff',
        padding: '0.85rem 1.75rem',
        borderRadius: '100px',
        fontWeight: 700,
        fontSize: '0.95rem',
        textDecoration: 'none',
        boxShadow: '0 4px 18px rgba(251,57,54,0.3)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      }}>
        Retour à l&apos;accueil
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
          <path d="M2.5 7.5h10M8.5 3.5l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </Link>
    </div>
  )
}
