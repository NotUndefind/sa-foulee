import Image from 'next/image'
import Link from 'next/link'

export default function FinalCTASection() {
  return (
    <section className="hidden md:block" style={{ padding: '7rem 1.5rem', background: '#FAFAFA' }}>
      <div
        className="sF-reveal"
        style={{ maxWidth: '640px', margin: '0 auto', textAlign: 'center' }}
      >
        {/* Trois points décoratifs */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '0.5rem',
            marginBottom: '2.25rem',
          }}
        >
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                width: i === 1 ? '32px' : '8px',
                height: '8px',
                borderRadius: '100px',
                background: i === 1 ? '#FB3936' : '#C0302E',
                opacity: i === 1 ? 1 : 0.2,
              }}
            />
          ))}
        </div>

        {/* Mascotte */}
        <div style={{ marginBottom: '2rem' }}>
          <Image
            src="/mascotte-removebg-preview.png"
            alt="Mascotte de La Neuville TAF sa Foulée"
            width={120}
            height={120}
            style={{
              objectFit: 'contain',
              margin: '0 auto',
              display: 'block',
              width: 'auto',
              height: 'auto',
            }}
          />
        </div>

        <h2
          style={{
            fontSize: 'clamp(2.25rem, 6vw, 4rem)',
            fontWeight: 800,
            color: '#1A1A1A',
            lineHeight: 1.05,
            marginBottom: '1.25rem',
          }}
        >
          Prêt à courir <span style={{ color: '#FB3936' }}>avec nous ?</span>
        </h2>

        <p
          style={{
            color: '#7F7F7F',
            fontSize: '1.05rem',
            lineHeight: 1.75,
            maxWidth: '460px',
            margin: '0 auto 2.75rem',
          }}
        >
          Rejoignez La Neuville TAF sa Foulée et découvrez la joie de courir en groupe, sur les plus
          beaux chemins de la région.
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/inscription" className="sF-btn">
            Rejoindre l&apos;association
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
              <path
                d="M2.5 7.5h10M8.5 3.5l4 4-4 4"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
          <Link href="/connexion" className="sF-btn-ghost">
            Se connecter
          </Link>
        </div>
      </div>
    </section>
  )
}
