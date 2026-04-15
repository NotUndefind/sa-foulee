import Link from 'next/link'

const ACTIVITIES = [
  {
    num: '01',
    title: 'Sorties hebdomadaires',
    desc: 'Chaque semaine, des sorties en groupe adaptées à votre niveau. Du footing tranquille au trail exigeant — il y en a pour tous.',
    d: 'sF-d1',
  },
  {
    num: '02',
    title: 'Compétitions locales',
    desc: 'Participez aux courses de la région sous nos couleurs. Nos membres se soutiennent, du 5 km au trail longue distance.',
    d: 'sF-d2',
  },
  {
    num: '03',
    title: "Sessions d'entraînement",
    desc: 'Plans personnalisés, séances de fractionné et renforcement musculaire pour progresser intelligemment et éviter les blessures.',
    d: 'sF-d3',
  },
]

export default function ActivitiesSection() {
  return (
    <section className="hidden md:block" style={{ padding: '6rem 1.5rem', background: '#E9E2D3' }}>
      <div style={{ maxWidth: '1040px', margin: '0 auto' }}>
        {/* Header avec lien */}
        <div
          className="sF-reveal"
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1.5rem',
            marginBottom: '3rem',
          }}
        >
          <div>
            <p className="sF-label">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <rect x="1" y="1" width="10" height="10" rx="3" stroke="#FB3936" strokeWidth="1.5" />
                <path d="M4 6h4M6 4v4" stroke="#FB3936" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              Nos activités
            </p>
            <h2
              style={{
                fontSize: 'clamp(2rem, 5vw, 3.25rem)',
                fontWeight: 800,
                color: '#1A1A1A',
                lineHeight: 1.1,
              }}
            >
              Une saison bien remplie
            </h2>
          </div>
          <Link
            href="/activites"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: '#C0302E',
              fontWeight: 600,
              fontSize: '0.9rem',
              textDecoration: 'none',
              borderBottom: '1.5px solid rgba(192,48,46,0.25)',
              paddingBottom: '2px',
              transition: 'border-color 0.2s ease, color 0.2s ease',
            }}
          >
            Voir les événements
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M2 7h10M8 3l4 4-4 4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(285px, 1fr))',
            gap: '1.25rem',
          }}
        >
          {ACTIVITIES.map((a) => (
            <div key={a.num} className={`sF-act sF-reveal ${a.d}`}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  marginBottom: '1.25rem',
                }}
              >
                <span
                  style={{
                    fontWeight: 800,
                    fontSize: '0.75rem',
                    color: '#FB3936',
                    letterSpacing: '0.08em',
                  }}
                >
                  {a.num}
                </span>
                <div style={{ height: '1px', flex: 1, background: 'rgba(192,48,46,0.15)' }} />
              </div>
              <h3
                style={{
                  fontSize: '1.1rem',
                  fontWeight: 800,
                  color: '#1A1A1A',
                  marginBottom: '0.7rem',
                }}
              >
                {a.title}
              </h3>
              <p style={{ color: '#7F7F7F', fontSize: '0.875rem', lineHeight: 1.75 }}>{a.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
