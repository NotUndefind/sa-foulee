import SectionHeader from '@/components/ui/SectionHeader'

const VALUES = [
  {
    accent: '#FB3936',
    title: 'Convivialité',
    punch: 'Courir ensemble, progresser ensemble.',
    desc: 'Une communauté soudée où chaque coureur, du débutant au compétiteur, trouve sa place et son rythme.',
    d: 'sF-d1',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FB3936" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    accent: '#C0302E',
    title: 'Nature',
    punch: 'Des sentiers qui nous ressemblent.',
    desc: 'Forêts, prairies et chemins de campagne — nos parcours invitent à sortir des sentiers battus.',
    d: 'sF-d2',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#C0302E" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L8 7H3l3.5 3-1.5 5L12 12l7 3-1.5-5L21 7h-5L12 2z" />
        <line x1="12" y1="12" x2="12" y2="22" />
      </svg>
    ),
  },
  {
    accent: '#D42F2D',
    title: 'Dépassement',
    punch: 'Chaque foulée compte.',
    desc: 'Se fixer des objectifs, les atteindre, et célébrer chaque progrès dans la bonne humeur.',
    d: 'sF-d3',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D42F2D" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
        <polyline points="16 7 22 7 22 13" />
      </svg>
    ),
  },
]

export default function ValuesSection() {
  return (
    <section
      id="decouvrir"
      className="hidden md:block"
      style={{ padding: '7rem 1.5rem', background: '#FAFAFA' }}
    >
      <div style={{ maxWidth: '1040px', margin: '0 auto' }}>
        <SectionHeader
          label="Nos valeurs"
          title="Ce qui nous fait courir"
          labelIcon={
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <circle cx="6" cy="6" r="5" stroke="#FB3936" strokeWidth="1.5" />
              <circle cx="6" cy="6" r="2" fill="#FB3936" />
            </svg>
          }
        />

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))',
            gap: '1.5rem',
          }}
        >
          {VALUES.map((v) => (
            <div key={v.title} className={`sF-card sF-reveal ${v.d}`}>
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '14px',
                  background: `${v.accent}12`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.4rem',
                  border: `1.5px solid ${v.accent}18`,
                }}
              >
                {v.icon}
              </div>
              <h3
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 800,
                  color: '#1A1A1A',
                  marginBottom: '0.4rem',
                }}
              >
                {v.title}
              </h3>
              <p
                style={{
                  color: v.accent,
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  marginBottom: '0.85rem',
                  lineHeight: 1.4,
                }}
              >
                {v.punch}
              </p>
              <p style={{ color: '#7F7F7F', fontSize: '0.875rem', lineHeight: 1.75 }}>{v.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
