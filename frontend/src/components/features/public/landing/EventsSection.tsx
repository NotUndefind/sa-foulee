import Link from 'next/link'
import SectionHeader from '@/components/ui/SectionHeader'

interface UpcomingEvent {
  id: number
  title: string
  type: string
  event_date: string
  location: string | null
}

interface EventsSectionProps {
  events: UpcomingEvent[]
}

const TYPE_LABEL: Record<string, string> = {
  race: 'Course',
  outing: 'Sortie',
  competition: 'Compétition',
  other: 'Événement',
}

const TYPE_COLOR: Record<string, string> = {
  race: '#FB3936',
  outing: '#D42F2D',
  competition: '#C0302E',
  other: '#7F7F7F',
}

export default function EventsSection({ events }: EventsSectionProps) {
  if (events.length === 0) return null

  return (
    <section style={{ padding: '7rem 1.5rem', background: '#FAFAFA' }}>
      <div style={{ maxWidth: '1040px', margin: '0 auto' }}>
        <SectionHeader
          label="Agenda de l'association"
          title="Nos prochaines sorties"
          subtitle="Rejoignez-nous sur les prochains événements et partagez la route avec l'association."
          labelIcon={
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#FB3936"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          }
        />

        {/* Cartes — desktop */}
        <div
          className="hidden md:grid"
          style={{
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2.5rem',
          }}
        >
          {events.map((ev, i) => {
            const d = new Date(ev.event_date)
            const day = d.toLocaleDateString('fr-FR', { day: '2-digit' })
            const month = d.toLocaleDateString('fr-FR', { month: 'short' }).replace('.', '')
            const weekday = d.toLocaleDateString('fr-FR', { weekday: 'long' })
            const time = d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
            const color = TYPE_COLOR[ev.type] ?? '#7F7F7F'
            const stagger = i === 0 ? 'sF-d1' : i === 1 ? 'sF-d2' : 'sF-d3'

            return (
              <div key={ev.id} className={`sF-card sF-reveal ${stagger}`} style={{ overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1.25rem' }}>
                  <div
                    style={{
                      flexShrink: 0,
                      width: '52px',
                      textAlign: 'center',
                      background: 'rgba(251,57,54,0.07)',
                      borderRadius: '12px',
                      padding: '0.5rem 0.25rem',
                      border: '1.5px solid rgba(251,57,54,0.14)',
                    }}
                  >
                    <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#FB3936', lineHeight: 1 }}>
                      {day}
                    </div>
                    <div
                      style={{
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        color: '#FB3936',
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                      }}
                    >
                      {month}
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <span
                      style={{
                        display: 'inline-block',
                        fontSize: '0.65rem',
                        fontWeight: 800,
                        color,
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        background: `${color}14`,
                        borderRadius: '999px',
                        padding: '0.2rem 0.6rem',
                        marginBottom: '0.35rem',
                      }}
                    >
                      {TYPE_LABEL[ev.type] ?? 'Événement'}
                    </span>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1A1A1A', lineHeight: 1.3 }}>
                      {ev.title}
                    </h3>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                  <div
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#7F7F7F', fontSize: '0.82rem' }}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#7F7F7F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    <span style={{ textTransform: 'capitalize' }}>{weekday} à {time}</span>
                  </div>
                  {ev.location && (
                    <div
                      style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#7F7F7F', fontSize: '0.82rem' }}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#7F7F7F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      <span>{ev.location}</span>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Liste compacte — mobile */}
        <div className="md:hidden" style={{ marginBottom: '2rem' }}>
          {events.map((ev, i) => {
            const d = new Date(ev.event_date)
            const day = d.toLocaleDateString('fr-FR', { day: '2-digit' })
            const month = d.toLocaleDateString('fr-FR', { month: 'short' }).replace('.', '')
            const weekday = d.toLocaleDateString('fr-FR', { weekday: 'short' })
            const color = TYPE_COLOR[ev.type] ?? '#7F7F7F'
            const stagger = i === 0 ? 'sF-d1' : i === 1 ? 'sF-d2' : 'sF-d3'

            return (
              <div
                key={ev.id}
                className={`sF-reveal ${stagger}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1rem 0',
                  borderBottom: '1px solid rgba(192,48,46,0.08)',
                }}
              >
                {/* Date badge */}
                <div
                  style={{
                    flexShrink: 0,
                    width: '48px',
                    textAlign: 'center',
                    background: 'rgba(251,57,54,0.07)',
                    borderRadius: '10px',
                    padding: '0.4rem 0.25rem',
                    border: '1px solid rgba(251,57,54,0.14)',
                  }}
                >
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#FB3936', lineHeight: 1 }}>{day}</div>
                  <div style={{ fontSize: '0.6rem', fontWeight: 700, color: '#FB3936', textTransform: 'uppercase' }}>
                    {month}
                  </div>
                </div>

                {/* Infos */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span
                    style={{
                      display: 'inline-block',
                      fontSize: '0.6rem',
                      fontWeight: 800,
                      color,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      background: `${color}14`,
                      borderRadius: '999px',
                      padding: '0.15rem 0.5rem',
                      marginBottom: '0.2rem',
                    }}
                  >
                    {TYPE_LABEL[ev.type] ?? 'Événement'}
                  </span>
                  <p style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1A1A1A', lineHeight: 1.3, marginBottom: '0.2rem' }}>
                    {ev.title}
                  </p>
                  <p style={{ fontSize: '0.78rem', color: '#7F7F7F' }}>
                    {weekday}
                    {ev.location ? ` · ${ev.location}` : ''}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {/* CTA */}
        <div className="sF-reveal sF-d3" style={{ textAlign: 'center' }}>
          <Link
            href="/activites"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: '#FB3936',
              fontWeight: 700,
              fontSize: '0.95rem',
              textDecoration: 'none',
              borderBottom: '2px solid rgba(251,57,54,0.3)',
              paddingBottom: '2px',
              transition: 'border-color 0.2s',
            }}
          >
            Voir toutes les activités
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  )
}
