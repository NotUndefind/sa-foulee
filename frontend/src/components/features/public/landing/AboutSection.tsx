import Image from 'next/image'
import Link from 'next/link'

export default function AboutSection() {
  return (
    <section className="hidden md:block" style={{ padding: '7rem 1.5rem', background: '#FAFAFA' }}>
      <div style={{ maxWidth: '1040px', margin: '0 auto' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '3.5rem',
            alignItems: 'center',
          }}
        >
          {/* Photo */}
          <div className="sF-reveal" style={{ position: 'relative' }}>
            <div
              style={{
                borderRadius: '24px',
                overflow: 'hidden',
                boxShadow: '0 24px 64px rgba(192,48,46,0.13)',
                border: '1.5px solid rgba(192,48,46,0.08)',
              }}
            >
              <Image
                src="/bureau.png"
                alt="Les membres du bureau de La Neuville TAF sa Foulée devant le panneau du village"
                width={540}
                height={380}
                style={{ width: '100%', height: 'auto', display: 'block' }}
              />
            </div>
            {/* Badge flottant */}
            <div
              style={{
                position: 'absolute',
                bottom: '-1rem',
                right: '1.5rem',
                background: '#FB3936',
                color: '#fff',
                borderRadius: '14px',
                padding: '0.6rem 1.1rem',
                fontSize: '0.78rem',
                fontWeight: 700,
                boxShadow: '0 8px 24px rgba(251,57,54,0.35)',
                letterSpacing: '0.03em',
              }}
            >
              Le bureau de l&apos;association
            </div>
          </div>

          {/* Texte */}
          <div className="sF-reveal sF-d2">
            <p className="sF-label">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path
                  d="M6 1l1.5 3.5H11L8.3 6.7l1 3.5L6 8l-3.3 2.2 1-3.5L1 4.5h3.5Z"
                  fill="#FB3936"
                />
              </svg>
              Notre association
            </p>
            <h2
              style={{
                fontSize: 'clamp(2rem, 5vw, 3rem)',
                fontWeight: 800,
                color: '#1A1A1A',
                lineHeight: 1.1,
                marginBottom: '1.25rem',
              }}
            >
              Une équipe passionnée,
              <br />
              <span style={{ color: '#FB3936' }}>au cœur du village</span>
            </h2>
            <p
              style={{
                color: '#7F7F7F',
                fontSize: '0.95rem',
                lineHeight: 1.8,
                marginBottom: '1.25rem',
              }}
            >
              La Neuville TAF sa Foulée est une association à but non lucratif fondée par des
              coureurs du village. Notre bureau, composé de bénévoles engagés, œuvre chaque année
              pour organiser des événements, accueillir de nouveaux membres et promouvoir la course à
              pied pour tous.
            </p>
            <p
              style={{
                color: '#7F7F7F',
                fontSize: '0.95rem',
                lineHeight: 1.8,
                marginBottom: '2rem',
              }}
            >
              Implantés à La Neuville, nous courons sur les chemins de notre territoire — forêts,
              prairies et routes de campagne — avec le clocher et le panneau du village comme points
              de repère fidèles.
            </p>
            <Link href="/inscription" className="sF-btn" style={{ display: 'inline-flex' }}>
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
          </div>
        </div>
      </div>
    </section>
  )
}
