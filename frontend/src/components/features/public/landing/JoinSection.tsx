import Link from 'next/link'
import SectionHeader from '@/components/ui/SectionHeader'

const STEPS = [
  {
    d: 'sF-d1',
    label: 'Étape 01',
    labelColor: '#FB3936',
    iconBg: 'rgba(251,57,54,0.1)',
    iconBorder: 'rgba(251,57,54,0.18)',
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#FB3936"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
    title: 'Inscription sur le site',
    desc: 'Inscrivez-vous sur notre site internet en cliquant sur le bouton ci-dessous et renseignez les informations demandées.',
  },
  {
    d: 'sF-d2',
    label: 'Étape 02',
    labelColor: '#C0302E',
    iconBg: 'rgba(192,48,46,0.07)',
    iconBorder: 'rgba(192,48,46,0.12)',
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#C0302E"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    title: 'Validation des informations',
    desc: "Un formulaire d'inscription va vous être envoyé par e-mail. Veuillez le compléter pour finaliser votre dossier.",
  },
  {
    d: 'sF-d3',
    label: 'Étape 03',
    labelColor: '#D42F2D',
    iconBg: 'rgba(169,50,38,0.1)',
    iconBorder: 'rgba(169,50,38,0.15)',
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#D42F2D"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="15" cy="4" r="2" />
        <path d="M10.5 8.5L8 17l4-2 3 4 2-8" />
        <path d="M16 8l-2.5.5-3 5" />
        <path d="M5 12l3.5 1" />
      </svg>
    ),
    title: 'Envoi du dossier',
    desc: 'Une fois complété, retournez-nous votre dossier par e-mail pour finaliser votre demande.',
  },
]

export default function JoinSection() {
  return (
    <section style={{ padding: '7rem 1.5rem', background: '#FAFAFA' }}>
      <div style={{ maxWidth: '1040px', margin: '0 auto' }}>
        <SectionHeader
          label="Rejoindre l'association"
          title="Trois étapes, c'est tout"
          subtitle="Rejoindre La Neuville TAF sa Foulée est simple et rapide. Du formulaire à votre première sortie, voici comment ça se passe."
          labelIcon={
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path
                d="M6 1l1.5 3.5H11L8.3 6.7l1 3.5L6 8l-3.3 2.2 1-3.5L1 4.5h3.5Z"
                fill="#FB3936"
              />
            </svg>
          }
        />

        {/* Étapes — desktop uniquement */}
        <div
          className="hidden md:grid"
          style={{
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.5rem',
          }}
        >
          {STEPS.map((s) => (
            <div
              key={s.label}
              className={`sF-card sF-reveal ${s.d}`}
              style={{ position: 'relative' }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  marginBottom: '1.5rem',
                }}
              >
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    flexShrink: 0,
                    background: s.iconBg,
                    border: `1.5px solid ${s.iconBorder}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {s.icon}
                </div>
                <span
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    color: s.labelColor,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                  }}
                >
                  {s.label}
                </span>
              </div>
              <h3
                style={{
                  fontSize: '1.2rem',
                  fontWeight: 800,
                  color: '#1A1A1A',
                  marginBottom: '0.6rem',
                }}
              >
                {s.title}
              </h3>
              <p style={{ color: '#7F7F7F', fontSize: '0.875rem', lineHeight: 1.75 }}>{s.desc}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="sF-reveal" style={{ textAlign: 'center', marginTop: '3.5rem' }}>
          <Link href="/inscription" className="sF-btn">
            Commencer l&apos;inscription
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
    </section>
  )
}
