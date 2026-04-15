interface HomepageStats {
  member_count: number
  total_km: number
}

interface StatsSectionProps {
  stats: HomepageStats
}

export default function StatsSection({ stats }: StatsSectionProps) {
  const items = [
    { num: '1', label: 'sortie / mois', sub: 'minimum garanti', d: 'sF-d1' },
    { num: String(stats.member_count), label: 'coureurs actifs', sub: 'membres du club', d: 'sF-d2' },
    {
      num: `${stats.total_km} km`,
      label: 'parcourus',
      sub: 'performances totales',
      d: 'sF-d3',
    },
  ]

  return (
    <section
      style={{
        padding: '6rem 1.5rem',
        background: '#F5F0EB',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Cercles décoratifs — desktop uniquement */}
      <div
        className="hidden md:block"
        style={{
          position: 'absolute',
          right: '-5%',
          top: '-20%',
          width: '45vw',
          height: '45vw',
          maxWidth: '500px',
          maxHeight: '500px',
          borderRadius: '50%',
          border: '1px solid rgba(192,48,46,0.06)',
          pointerEvents: 'none',
        }}
      />
      <div
        className="hidden md:block"
        style={{
          position: 'absolute',
          right: '5%',
          top: '-10%',
          width: '30vw',
          height: '30vw',
          maxWidth: '340px',
          maxHeight: '340px',
          borderRadius: '50%',
          border: '1px solid rgba(192,48,46,0.04)',
          pointerEvents: 'none',
        }}
      />

      <div style={{ maxWidth: '1040px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
        {/* Header — desktop uniquement */}
        <div className="sF-reveal hidden md:block" style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <p className="sF-label" style={{ color: '#C0302E' }}>
            En chiffres
          </p>
          <h2
            style={{
              fontSize: 'clamp(1.75rem, 4vw, 2.75rem)',
              fontWeight: 800,
              color: '#1A1A1A',
              lineHeight: 1.15,
            }}
          >
            La Neuville TAF sa Foulée, c&apos;est
          </h2>
        </div>

        {/* Titre mobile uniquement */}
        <div className="sF-reveal md:hidden" style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <p className="sF-label" style={{ color: '#C0302E' }}>
            En chiffres
          </p>
        </div>

        {/* Grille stats */}
        <div className="grid grid-cols-3 gap-2 md:grid-cols-3">
          {items.map((s) => (
            <div
              key={s.label}
              className={`sF-reveal sF-stat-item ${s.d}`}
              style={{
                textAlign: 'center',
                padding: '2.5rem 1.5rem',
                borderRadius: '18px',
                background: 'rgba(255,255,255,0.7)',
                border: '1px solid rgba(192,48,46,0.08)',
              }}
            >
              <div
                style={{
                  fontSize: 'clamp(2rem, 7vw, 5.5rem)',
                  fontWeight: 800,
                  color: '#C0302E',
                  lineHeight: 1,
                  marginBottom: '0.6rem',
                }}
              >
                {s.num}
              </div>
              <div
                style={{
                  color: '#1A1A1A',
                  fontWeight: 700,
                  fontSize: 'clamp(0.7rem, 2vw, 1.05rem)',
                  marginBottom: '0.3rem',
                }}
              >
                {s.label}
              </div>
              <div style={{ color: '#7F7F7F', fontSize: 'clamp(0.65rem, 1.5vw, 0.85rem)' }}>{s.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
