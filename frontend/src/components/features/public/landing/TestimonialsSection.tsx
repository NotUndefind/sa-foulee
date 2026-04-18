import SectionHeader from '@/components/ui/SectionHeader'

const TESTIMONIALS = [
  {
    quote:
      "J'ai rejoint La Neuville TAF sa Foulée sans vraiment courir. Aujourd'hui je fais 15 km le dimanche matin et je ne raterais ça pour rien au monde.",
    name: 'Camille B.',
    role: 'Membre depuis 2 ans',
    initial: 'C',
    d: 'sF-d1',
  },
  {
    quote:
      "Ce que j'aime ici, c'est qu'on ne se prend pas la tête. Il y a des groupes pour tous les niveaux, et l'ambiance après les sorties est vraiment sympa.",
    name: 'Thomas L.',
    role: 'Membre depuis 1 an',
    initial: 'T',
    d: 'sF-d2',
  },
  {
    quote:
      "Je cherchais une association accessible. Le processus d'inscription était simple, et dès la première sortie j'ai su que j'avais trouvé ma place.",
    name: 'Marie-Claire D.',
    role: 'Membre depuis 3 ans',
    initial: 'M',
    d: 'sF-d3',
  },
]

export default function TestimonialsSection() {
  return (
    <section className="hidden md:block" style={{ padding: '6rem 1.5rem', background: '#E9E2D3' }}>
      <div style={{ maxWidth: '1040px', margin: '0 auto' }}>
        <SectionHeader
          label="Ils courent avec nous"
          title="Ce qu'ils en disent"
          labelIcon={
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <circle cx="6" cy="6" r="5" stroke="#FB3936" strokeWidth="1.5" />
              <path
                d="M4 5c0-.55.45-1 1-1h2c.55 0 1 .45 1 1v1.5c0 .55-.45 1-1 1H6l-1 1.5V7.5H5c-.55 0-1-.45-1-1V5z"
                fill="#FB3936"
                opacity=".7"
              />
            </svg>
          }
        />

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.5rem',
          }}
        >
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className={`sF-card sF-reveal ${t.d}`}>
              <div style={{ marginBottom: '1.25rem' }}>
                <svg width="28" height="22" viewBox="0 0 28 22" fill="none">
                  <path
                    d="M0 22V13.2C0 5.73 4.2 1.4 12.6 0l1.4 2.52C9.8 3.36 7.56 5.18 6.86 8H12V22H0zm16 0V13.2C16 5.73 20.2 1.4 28.6 0L30 2.52C25.8 3.36 23.56 5.18 22.86 8H28V22H16z"
                    fill="#C0302E"
                    fillOpacity="0.12"
                  />
                </svg>
              </div>
              <p
                style={{
                  color: '#3A4A2E',
                  fontSize: '0.925rem',
                  lineHeight: 1.8,
                  marginBottom: '1.5rem',
                  fontStyle: 'italic',
                }}
              >
                &ldquo;{t.quote}&rdquo;
              </p>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  borderTop: '1px solid rgba(192,48,46,0.08)',
                  paddingTop: '1rem',
                }}
              >
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    flexShrink: 0,
                    background: 'rgba(251,57,54,0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    color: '#FB3936',
                  }}
                >
                  {t.initial}
                </div>
                <div>
                  <p style={{ fontWeight: 700, color: '#1A1A1A', fontSize: '0.875rem' }}>
                    {t.name}
                  </p>
                  <p style={{ fontSize: '0.75rem', color: '#7F7F7F' }}>{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
