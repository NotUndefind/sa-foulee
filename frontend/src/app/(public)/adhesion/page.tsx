import type { Metadata } from 'next'
import Link from 'next/link'
import { Baloo_2 } from 'next/font/google'

export const metadata: Metadata = {
  title: 'Adhérer — La Neuville TAF sa Foulée',
  description:
    "Rejoignez l'association La Neuville TAF sa Foulée. Découvrez les avantages de l'adhésion et payez votre cotisation annuelle en ligne via HelloAsso.",
}

const baloo = Baloo_2({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
})

const HELLOASSO_URL = process.env.NEXT_PUBLIC_HELLOASSO_FORM_URL ?? '#'

function IconCheck() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="9" r="9" fill="rgba(251,57,54,0.1)" />
      <path d="M5.5 9.5l2.5 2.5 4.5-5" stroke="#FB3936" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconArrow() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

const INCLUDED_ITEMS = [
  'Accès à tous les entraînements hebdomadaires',
  'Participation aux sorties et événements du club',
  'Accompagnement et conseils de nos coachs bénévoles',
  'Accès à l\'espace membre et suivi de vos performances',
  'Assurance sportive incluse (licence FFA)',
  'Réductions partenaires locaux',
]

export default function AdhesionPage() {
  return (
    <div className={baloo.className} style={{ background: '#FAFAFA', minHeight: '100vh' }}>
      <style>{`
        :root {
          --primary: #FB3936;
          --primary-dark: #D42F2D;
          --sidebar: #C0302E;
          --muted: #7F7F7F;
          --bark: #1A1A1A;
        }

        @keyframes adh-fadeUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .adh-fade { animation: adh-fadeUp 0.6s cubic-bezier(.22,1,.36,1) both; }
        .adh-d1 { animation-delay: 0.05s; }
        .adh-d2 { animation-delay: 0.15s; }
        .adh-d3 { animation-delay: 0.25s; }
        .adh-d4 { animation-delay: 0.35s; }

        .adh-card {
          background: white;
          border-radius: 24px;
          border: 1px solid rgba(251,57,54,0.09);
          box-shadow: 0 2px 16px rgba(251,57,54,0.06);
        }

        .adh-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.6rem;
          background: #FB3936;
          color: #fff;
          padding: 1rem 2.25rem;
          border-radius: 100px;
          font-weight: 700;
          font-size: 1.05rem;
          text-decoration: none;
          transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
          box-shadow: 0 6px 28px rgba(251,57,54,0.38);
        }
        .adh-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 40px rgba(251,57,54,0.46);
          background: #D42F2D;
        }

        .adh-ghost {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          color: #C0302E;
          padding: 1rem 2rem;
          border-radius: 100px;
          font-weight: 600;
          font-size: 1rem;
          text-decoration: none;
          border: 2px solid rgba(192,48,46,0.22);
          transition: border-color 0.2s ease, background 0.2s ease, transform 0.2s ease;
        }
        .adh-ghost:hover {
          border-color: #C0302E;
          background: rgba(192,48,46,0.05);
          transform: translateY(-2px);
        }
      `}</style>

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section style={{
        padding: '5rem 1.5rem 4rem',
        background: 'linear-gradient(150deg, #FAFAFA 0%, #F0EDED 60%, #EAE0D6 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Background circle */}
        <div style={{
          position: 'absolute', right: '-5%', top: '5%',
          width: '45vw', height: '45vw', maxWidth: '520px', maxHeight: '520px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(251,57,54,0.07) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{ maxWidth: '780px', margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 2 }}>
          {/* Badge */}
          <div className="adh-fade adh-d1" style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            background: 'rgba(251,57,54,0.07)', color: '#C0302E',
            padding: '0.4rem 1.1rem', borderRadius: '100px',
            fontSize: '0.85rem', fontWeight: 700,
            marginBottom: '1.75rem', border: '1px solid rgba(192,48,46,0.1)',
          }}>
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path d="M6.5 1.5C4 1.5 1.5 4 2.5 7C3.5 10 6.5 11.5 6.5 11.5C6.5 11.5 9.5 10 10.5 7C11.5 4 9 1.5 6.5 1.5Z" fill="#D42F2D" opacity="0.7" />
              <path d="M4.5 6.5l1.5 1.5 2.5-3" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Adhésion 2025–2026
          </div>

          <h1 className="adh-fade adh-d2" style={{
            fontSize: 'clamp(2.5rem, 7vw, 4.5rem)',
            fontWeight: 800,
            color: '#FB3936',
            letterSpacing: '-0.02em',
            lineHeight: 1.05,
            margin: '0 0 1.25rem',
          }}>
            Rejoignez la Foulée
          </h1>

          <p className="adh-fade adh-d3" style={{
            fontSize: 'clamp(1rem, 2.5vw, 1.15rem)',
            color: '#3A3A3A',
            maxWidth: '520px',
            margin: '0 auto 2.5rem',
            lineHeight: 1.7,
          }}>
            Association de course à pied ouverte à tous — débutants comme confirmés.
            Une cotisation annuelle pour courir ensemble et partager la passion du trail.
          </p>

          <div className="adh-fade adh-d4" style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            {HELLOASSO_URL !== '#' ? (
              <a href={HELLOASSO_URL} target="_blank" rel="noopener noreferrer" className="adh-btn">
                Payer ma cotisation
                <IconArrow />
              </a>
            ) : (
              <span className="adh-btn" style={{ opacity: 0.5, cursor: 'not-allowed' }}>
                Paiement bientôt disponible
              </span>
            )}
            <Link href="/activites" className="adh-ghost">
              Voir nos activités
            </Link>
          </div>
        </div>
      </section>

      {/* ── Tarif + avantages ────────────────────────────────────────── */}
      <section style={{ padding: '5rem 1.5rem', maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>

          {/* Tarif */}
          <div className="adh-card" style={{ padding: '2.5rem', textAlign: 'center' }}>
            <p style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#FB3936', marginBottom: '0.75rem' }}>
              Cotisation annuelle
            </p>
            <div style={{ fontSize: 'clamp(3rem, 8vw, 5rem)', fontWeight: 800, color: '#FB3936', lineHeight: 1, marginBottom: '0.25rem' }}>
              30<span style={{ fontSize: '2rem', verticalAlign: 'super' }}>€</span>
            </div>
            <p style={{ color: '#7F7F7F', fontSize: '0.9rem', marginBottom: '2rem' }}>
              Saison 2025 – 2026
            </p>
            {HELLOASSO_URL !== '#' ? (
              <a href={HELLOASSO_URL} target="_blank" rel="noopener noreferrer" className="adh-btn" style={{ width: '100%', justifyContent: 'center' }}>
                Payer via HelloAsso
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            ) : (
              <div style={{
                padding: '0.85rem 1.5rem', borderRadius: '100px', textAlign: 'center',
                background: 'rgba(251,57,54,0.07)', color: '#D42F2D',
                fontSize: '0.9rem', fontWeight: 600, border: '1px solid rgba(251,57,54,0.15)',
              }}>
                Paiement en ligne bientôt disponible
              </div>
            )}
            <p style={{ marginTop: '1.25rem', fontSize: '0.78rem', color: '#7F7F7F' }}>
              Paiement sécurisé via HelloAsso — 0% de frais pour l&apos;association
            </p>
          </div>

          {/* Ce que ça inclut */}
          <div className="adh-card" style={{ padding: '2.5rem' }}>
            <p style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#FB3936', marginBottom: '1.5rem' }}>
              Ce que ça inclut
            </p>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
              {INCLUDED_ITEMS.map((item) => (
                <li key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <span style={{ flexShrink: 0, marginTop: '1px' }}>
                    <IconCheck />
                  </span>
                  <span style={{ color: '#2C2C2C', fontSize: '0.95rem', lineHeight: 1.5 }}>{item}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </section>

      {/* ── Présentation association ──────────────────────────────────── */}
      <section style={{
        padding: '5rem 1.5rem',
        background: 'linear-gradient(135deg, rgba(251,57,54,0.03) 0%, rgba(192,48,46,0.05) 100%)',
        borderTop: '1px solid rgba(251,57,54,0.08)',
        borderBottom: '1px solid rgba(251,57,54,0.08)',
      }}>
        <div style={{ maxWidth: '680px', margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#FB3936', marginBottom: '1rem' }}>
            L&apos;association
          </p>
          <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, color: '#1A1A1A', marginBottom: '1.5rem', letterSpacing: '-0.02em' }}>
            La Neuville TAF sa Foulée
          </h2>
          <p style={{ color: '#3A3A3A', fontSize: '1.05rem', lineHeight: 1.8, marginBottom: '1rem' }}>
            Fondée dans l&apos;esprit de la convivialité et du dépassement de soi, notre association accueille
            coureurs de tous niveaux dans un cadre bienveillant. Du jogging dominical au trail en forêt,
            chaque sortie est une invitation à se retrouver et à progresser ensemble.
          </p>
          <p style={{ color: '#7F7F7F', fontSize: '0.95rem', lineHeight: 1.7 }}>
            Entraînements réguliers, événements locaux, ambiance familiale — voilà ce qui nous rassemble.
          </p>
        </div>
      </section>

      {/* ── CTA bas de page ──────────────────────────────────────────── */}
      <section style={{ padding: '5rem 1.5rem', textAlign: 'center' }}>
        <p style={{ color: '#7F7F7F', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          Des questions ? Contactez-nous avant de vous lancer.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          {HELLOASSO_URL !== '#' && (
            <a href={HELLOASSO_URL} target="_blank" rel="noopener noreferrer" className="adh-btn">
              Payer ma cotisation
              <IconArrow />
            </a>
          )}
          <Link href="/" className="adh-ghost">
            Retour à l&apos;accueil
          </Link>
        </div>
      </section>
    </div>
  )
}
