import ScrollReveal from '@/components/ui/ScrollReveal'
import type { Metadata } from 'next'
import { Baloo_2 } from 'next/font/google'
import Image from 'next/image'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'La Neuville TAF sa Foulée — Association de course à pied',
  description:
    "Rejoignez La Neuville TAF sa Foulée, l'association de course à pied conviviale de votre village. Entraînements, événements et bonne humeur garantis !",
}

export const revalidate = 300

const baloo = Baloo_2({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
})

export default async function PublicHomePage() {
  // Fetch 3 upcoming public events (server-side, no auth needed)
  let upcomingEvents: Array<{
    id: number
    title: string
    type: string
    event_date: string
    location: string | null
  }> = []
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1'
    const res = await fetch(`${apiUrl}/events?upcoming=1&per_page=3&is_public=1`, {
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(5000),
    })
    if (res.ok) {
      const json = await res.json()
      upcomingEvents = json.data ?? []
    }
  } catch {
    // Silently fail — section is hidden if no events
  }

  let homepageStats = { member_count: 7, total_km: 50 }
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1'
    const res = await fetch(`${apiUrl}/stats/homepage`, {
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(5000),
    })
    if (res.ok) {
      homepageStats = await res.json()
    }
  } catch {
    // Fallback: valeurs par défaut
  }

  return (
    <div className={baloo.className} style={{ background: '#FAFAFA', minHeight: '100vh' }}>
      {/* ─────────────────────────────────────────── STYLES ── */}
      <style>{`
        /* ── Variables ── */
        :root {
          --cream:         #FAFAFA;
          --parchm:        #F0EDED;
          --primary:       #FB3936;
          --primary-dark:  #D42F2D;
          --primary-light: #FD6563;
          --sidebar:       #C0302E;
          --muted:         #7F7F7F;
          --bark:          #1A1A1A;
        }

        /* ── Keyframes ── */
        @keyframes sF-fadeUp {
          from { opacity: 0; transform: translateY(36px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes sF-fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes sF-drawPath {
          from { stroke-dashoffset: 900; opacity: 0; }
          to   { stroke-dashoffset: 0;   opacity: 1; }
        }
        @keyframes sF-float {
          0%,100% { transform: translateY(0px) rotate(0deg); }
          50%     { transform: translateY(-14px) rotate(2deg); }
        }
        @keyframes sF-shimmer {
          from { background-position: -200% center; }
          to   { background-position: 200% center; }
        }
        @keyframes sF-pulse-ring {
          0%   { transform: scale(1);   opacity: 0.4; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        @keyframes sF-blob {
          0%,100% { transform: scale(1)    translate(0px, 0px); }
          33%     { transform: scale(1.06) translate(10px, -14px); }
          66%     { transform: scale(0.96) translate(-8px, 10px); }
        }

        /* ── Hero entrance ── */
        .sF-tag   { animation: sF-fadeUp 0.65s cubic-bezier(.22,1,.36,1) both; animation-delay: 0.05s; }
        .sF-h1    { animation: sF-fadeUp 0.75s cubic-bezier(.22,1,.36,1) both; animation-delay: 0.2s; }
        .sF-sub   { animation: sF-fadeUp 0.75s cubic-bezier(.22,1,.36,1) both; animation-delay: 0.38s; }
        .sF-cta   { animation: sF-fadeUp 0.75s cubic-bezier(.22,1,.36,1) both; animation-delay: 0.52s; }
        .sF-deco  { animation: sF-float  7s   ease-in-out infinite; animation-delay: 1s; }
        .sF-line  {
          stroke-dasharray: 900;
          animation: sF-drawPath 2.2s cubic-bezier(.22,1,.36,1) both;
          animation-delay: 0.7s;
        }

        /* ── Scroll reveal ── */
        .sF-reveal {
          opacity: 0;
          transform: translateY(28px);
          transition: opacity 0.75s cubic-bezier(.22,1,.36,1),
                      transform 0.75s cubic-bezier(.22,1,.36,1);
        }
        .sF-reveal.on { opacity: 1; transform: translateY(0); }
        .sF-d1 { transition-delay: 0.05s; }
        .sF-d2 { transition-delay: 0.15s; }
        .sF-d3 { transition-delay: 0.25s; }
        .sF-d4 { transition-delay: 0.35s; }

        /* ── Cards ── */
        .sF-card {
          background: white;
          border-radius: 20px;
          padding: 2rem 1.75rem;
          border: 1.5px solid rgba(192,48,46,0.08);
          transition: transform 0.35s cubic-bezier(.22,1,.36,1),
                      box-shadow 0.35s ease,
                      border-color 0.3s ease;
        }
        .sF-card:hover {
          transform: translateY(-7px);
          box-shadow: 0 24px 56px rgba(192,48,46,0.11);
          border-color: rgba(192,48,46,0.18);
        }

        /* ── Activity blocks ── */
        .sF-act {
          padding: 1.75rem;
          border-radius: 18px;
          background: rgba(192,48,46,0.04);
          border: 1.5px solid rgba(192,48,46,0.09);
          transition: background 0.3s ease, border-color 0.3s ease, transform 0.3s ease;
        }
        .sF-act:hover {
          background: rgba(192,48,46,0.07);
          border-color: rgba(192,48,46,0.18);
          transform: translateY(-3px);
        }

        /* ── Buttons ── */
        .sF-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: #FB3936;
          color: #fff;
          padding: 0.9rem 2rem;
          border-radius: 100px;
          font-weight: 700;
          font-size: 1rem;
          text-decoration: none;
          transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
          box-shadow: 0 4px 22px rgba(251,57,54,0.38);
        }
        .sF-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 36px rgba(251,57,54,0.46);
          background: #D42F2D;
        }
        .sF-btn-ghost {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          color: #C0302E;
          padding: 0.9rem 2rem;
          border-radius: 100px;
          font-weight: 600;
          font-size: 1rem;
          text-decoration: none;
          border: 2px solid rgba(192,48,46,0.22);
          transition: border-color 0.2s ease, background 0.2s ease, transform 0.2s ease;
        }
        .sF-btn-ghost:hover {
          border-color: #C0302E;
          background: rgba(192,48,46,0.05);
          transform: translateY(-2px);
        }

        /* ── Footer links ── */
        .sF-flink {
          color: rgba(255,255,255,0.45);
          text-decoration: none;
          font-size: 0.875rem;
          transition: color 0.2s;
          position: relative;
        }
        .sF-flink::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 0;
          height: 1.5px;
          background: #FB3936;
          transition: width 0.25s ease;
        }
        .sF-flink:hover { color: rgba(255,255,255,0.9); }
        .sF-flink:hover::after { width: 100%; }

        /* ── Section label ── */
        .sF-label {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          color: #FB3936;
          font-weight: 700;
          font-size: 0.8rem;
          letter-spacing: 0.13em;
          text-transform: uppercase;
          margin-bottom: 0.875rem;
        }
      `}</style>

      {/* ─────────────────────────────────────────── HERO ── */}
      <section
        style={{
          minHeight: 'calc(100vh - 68px)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
          padding: '5rem 1.5rem 8rem',
          background: 'linear-gradient(150deg, #FAFAFA 0%, #F5F0EB 60%, #FAF0EE 100%)',
        }}
      >
        {/* Formes décoratives animées */}
        <div
          style={{
            position: 'absolute',
            right: '-10%',
            top: '5%',
            width: '55vw',
            height: '55vw',
            maxWidth: '680px',
            maxHeight: '680px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(251,57,54,0.06) 0%, transparent 70%)',
            animation: 'sF-blob 9s ease-in-out infinite',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: '-8%',
            bottom: '5%',
            width: '38vw',
            height: '38vw',
            maxWidth: '440px',
            maxHeight: '440px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(251,57,54,0.05) 0%, transparent 70%)',
            animation: 'sF-blob 12s ease-in-out infinite reverse',
            animationDelay: '2s',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: '30%',
            top: '-12%',
            width: '28vw',
            height: '28vw',
            maxWidth: '320px',
            maxHeight: '320px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(192,48,46,0.04) 0%, transparent 70%)',
            animation: 'sF-blob 15s ease-in-out infinite',
            animationDelay: '4s',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            right: '25%',
            bottom: '-8%',
            width: '20vw',
            height: '20vw',
            maxWidth: '240px',
            maxHeight: '240px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(251,57,54,0.05) 0%, transparent 70%)',
            animation: 'sF-blob 10s ease-in-out infinite reverse',
            animationDelay: '1s',
            pointerEvents: 'none',
          }}
        />

        {/* Mascotte flottante */}
        <div
          className="sF-deco"
          style={{
            position: 'absolute',
            right: '4%',
            top: '50%',
            transform: 'translateY(-50%)',
            pointerEvents: 'none',
          }}
        >
          <Image
            src="/mascotte-removebg-preview.png"
            alt="Mascotte de La Neuville TAF sa Foulée"
            width={320}
            height={370}
            priority
            style={{ objectFit: 'contain', maxWidth: '26vw', minWidth: '150px' }}
          />
        </div>

        {/* Animated wavy line */}
        <svg
          style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', opacity: 0.18 }}
          viewBox="0 0 1440 90"
          preserveAspectRatio="none"
        >
          <path
            className="sF-line"
            d="M0 65 C180 20 360 80 540 45 C720 10 900 75 1080 38 C1260 8 1380 60 1440 40"
            stroke="#C0302E"
            strokeWidth="2.5"
            fill="none"
          />
        </svg>

        {/* Dot grid decoration */}
        <svg
          style={{
            position: 'absolute',
            left: '3%',
            top: '12%',
            opacity: 0.12,
            pointerEvents: 'none',
          }}
          width="120"
          height="120"
          viewBox="0 0 120 120"
        >
          {Array.from({ length: 5 }, (_, row) =>
            Array.from({ length: 5 }, (_, col) => (
              <circle
                key={`${row}-${col}`}
                cx={12 + col * 24}
                cy={12 + row * 24}
                r="2.5"
                fill="#C0302E"
              />
            ))
          )}
        </svg>

        {/* Content */}
        <div
          style={{
            maxWidth: '780px',
            margin: '0 auto',
            textAlign: 'center',
            position: 'relative',
            zIndex: 2,
          }}
        >
          {/* Badge */}
          <div
            className="sF-tag"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'rgba(251,57,54,0.07)',
              color: '#C0302E',
              padding: '0.4rem 1.1rem',
              borderRadius: '100px',
              fontSize: '0.85rem',
              fontWeight: 700,
              marginBottom: '2rem',
              border: '1px solid rgba(192,48,46,0.1)',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M7 1C4 1 1 4 2 7.5C3 11 7 13 7 13C7 13 11 11 12 7.5C13 4 10 1 7 1Z"
                fill="#D42F2D"
                opacity="0.7"
              />
              <path
                d="M7 4L7 7.5M7 7.5L9 9M7 7.5L5 9"
                stroke="white"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
            </svg>
            Association de course à pied
          </div>

          {/* Main title */}
          <h1 className="sF-h1" style={{ margin: '0 0 1.75rem', lineHeight: 1 }}>
            <span
              style={{
                display: 'block',
                fontSize: 'clamp(1.1rem, 3vw, 1.8rem)',
                fontWeight: 400,
                color: '#7F7F7F',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                marginBottom: '0.2em',
              }}
            >
              La Neuville TAF
            </span>
            <span
              style={{
                display: 'block',
                fontSize: 'clamp(4.5rem, 14vw, 10rem)',
                fontWeight: 800,
                color: '#FB3936',
                letterSpacing: '-0.03em',
                lineHeight: 0.88,
              }}
            >
              sa Foulée
            </span>
          </h1>

          {/* Subtitle */}
          <p
            className="sF-sub"
            style={{
              fontSize: 'clamp(1rem, 2.5vw, 1.2rem)',
              color: '#C0302E',
              maxWidth: '500px',
              margin: '0 auto 3rem',
              lineHeight: 1.7,
              fontWeight: 400,
            }}
          >
            L&apos;association de course à pied de votre village — ouverte à tous, portée par la
            passion du trail et la convivialité.
          </p>

          {/* CTAs */}
          <div
            className="sF-cta"
            style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}
          >
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
            <a href="#decouvrir" className="sF-btn-ghost">
              Découvrir
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                <path
                  d="M7.5 2.5v10M3.5 8.5l4 4 4-4"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────── VALEURS ── */}
      <section id="decouvrir" style={{ padding: '7rem 1.5rem', background: '#FAFAFA' }}>
        <div style={{ maxWidth: '1040px', margin: '0 auto' }}>
          {/* Header */}
          <div className="sF-reveal" style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <p className="sF-label">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <circle cx="6" cy="6" r="5" stroke="#FB3936" strokeWidth="1.5" />
                <circle cx="6" cy="6" r="2" fill="#FB3936" />
              </svg>
              Nos valeurs
            </p>
            <h2
              style={{
                fontSize: 'clamp(2rem, 5vw, 3.25rem)',
                fontWeight: 800,
                color: '#1A1A1A',
                lineHeight: 1.1,
              }}
            >
              Ce qui nous fait courir
            </h2>
          </div>

          {/* Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))',
              gap: '1.5rem',
            }}
          >
            {[
              {
                emoji: '🤝',
                accent: '#FB3936',
                title: 'Convivialité',
                punch: 'Courir ensemble, progresser ensemble.',
                desc: 'Une communauté soudée où chaque coureur, du débutant au compétiteur, trouve sa place et son rythme.',
                d: 'sF-d1',
              },
              {
                emoji: '🌲',
                accent: '#C0302E',
                title: 'Nature',
                punch: 'Des sentiers qui nous ressemblent.',
                desc: 'Forêts, prairies et chemins de campagne — nos parcours invitent à sortir des sentiers battus.',
                d: 'sF-d2',
              },
              {
                emoji: '⬆️',
                accent: '#D42F2D',
                title: 'Dépassement',
                punch: 'Chaque foulée compte.',
                desc: 'Se fixer des objectifs, les atteindre, et célébrer chaque progrès dans la bonne humeur.',
                d: 'sF-d3',
              },
            ].map((v) => (
              <div key={v.title} className={`sF-card sF-reveal ${v.d}`}>
                {/* Icon badge */}
                <div
                  style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '14px',
                    background: `${v.accent}12`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.6rem',
                    marginBottom: '1.4rem',
                    border: `1.5px solid ${v.accent}18`,
                  }}
                >
                  {v.emoji}
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

      {/* ─────────────────────────────────────────── ACTIVITÉS ── */}
      <section style={{ padding: '6rem 1.5rem', background: '#E9E2D3' }}>
        <div style={{ maxWidth: '1040px', margin: '0 auto' }}>
          {/* Header */}
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
                  <rect
                    x="1"
                    y="1"
                    width="10"
                    height="10"
                    rx="3"
                    stroke="#FB3936"
                    strokeWidth="1.5"
                  />
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
              href="/evenements"
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

          {/* Activity blocks */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(285px, 1fr))',
              gap: '1.25rem',
            }}
          >
            {[
              {
                num: '01',
                emoji: '🏃',
                title: 'Sorties hebdomadaires',
                desc: 'Chaque semaine, des sorties en groupe adaptées à votre niveau. Du footing tranquille au trail exigeant — il y en a pour tous.',
                d: 'sF-d1',
              },
              {
                num: '02',
                emoji: '🏆',
                title: 'Compétitions locales',
                desc: 'Participez aux courses de la région sous nos couleurs. Nos membres se soutiennent, du 5 km au trail longue distance.',
                d: 'sF-d2',
              },
              {
                num: '03',
                emoji: '💪',
                title: "Sessions d'entraînement",
                desc: 'Plans personnalisés, séances de fractionné et renforcement musculaire pour progresser intelligemment et éviter les blessures.',
                d: 'sF-d3',
              },
            ].map((a) => (
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
                  <span style={{ fontSize: '1.25rem' }}>{a.emoji}</span>
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

      {/* ─────────────────────────────────────────── STATS ── */}
      <section
        style={{
          padding: '6rem 1.5rem',
          background: '#F5F0EB',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative circles */}
        <div
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
          {/* Header */}
          <div className="sF-reveal" style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <p className="sF-label" style={{ color: '#C0302E' }}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path
                  d="M6 1L7.5 4.5H11L8.3 6.7 9.3 10.2 6 8 2.7 10.2 3.7 6.7 1 4.5H4.5Z"
                  fill="#C0302E"
                />
              </svg>
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

          {/* Stat grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '0.5rem',
            }}
          >
            {[
              { num: '1', label: 'sortie / mois', sub: 'minimum garanti', d: 'sF-d1' },
              {
                num: String(homepageStats.member_count),
                label: 'coureurs actifs',
                sub: 'membres du club',
                d: 'sF-d2',
              },
              {
                num: String(homepageStats.total_km) + ' km',
                label: 'parcourus',
                sub: 'performances totales',
                d: 'sF-d3',
              },
            ].map((s) => (
              <div
                key={s.label}
                className={`sF-reveal ${s.d}`}
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
                    fontSize: 'clamp(3.5rem, 9vw, 5.5rem)',
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
                    fontSize: '1.05rem',
                    marginBottom: '0.3rem',
                  }}
                >
                  {s.label}
                </div>
                <div style={{ color: '#7F7F7F', fontSize: '0.85rem' }}>{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────── NOS PROCHAINES SORTIES ── */}
      {upcomingEvents.length > 0 && (
        <section style={{ padding: '7rem 1.5rem', background: '#FAFAFA' }}>
          <div style={{ maxWidth: '1040px', margin: '0 auto' }}>
            {/* Header */}
            <div className="sF-reveal" style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
              <p className="sF-label">
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
                Agenda de l&apos;association
              </p>
              <h2
                style={{
                  fontSize: 'clamp(2rem, 5vw, 3.25rem)',
                  fontWeight: 800,
                  color: '#1A1A1A',
                  lineHeight: 1.1,
                }}
              >
                Nos prochaines sorties
              </h2>
              <p
                style={{
                  marginTop: '0.875rem',
                  color: '#7F7F7F',
                  fontSize: '1rem',
                  maxWidth: '480px',
                  margin: '0.875rem auto 0',
                  lineHeight: 1.7,
                }}
              >
                Rejoignez-nous sur les prochains événements et partagez la route avec
                l&apos;association.
              </p>
            </div>

            {/* Event cards */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '1.5rem',
                marginBottom: '2.5rem',
              }}
            >
              {upcomingEvents.map((ev, i) => {
                const d = new Date(ev.event_date)
                const day = d.toLocaleDateString('fr-FR', { day: '2-digit' })
                const month = d.toLocaleDateString('fr-FR', { month: 'short' }).replace('.', '')
                const weekday = d.toLocaleDateString('fr-FR', { weekday: 'long' })
                const time = d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
                const typeLabel: Record<string, string> = {
                  race: 'Course',
                  outing: 'Sortie',
                  competition: 'Compétition',
                  other: 'Événement',
                }
                const typeColor: Record<string, string> = {
                  race: '#FB3936',
                  outing: '#D42F2D',
                  competition: '#C0302E',
                  other: '#7F7F7F',
                }
                const color = typeColor[ev.type] ?? '#7F7F7F'
                const stagger = i === 0 ? 'sF-d1' : i === 1 ? 'sF-d2' : 'sF-d3'
                return (
                  <div
                    key={ev.id}
                    className={`sF-card sF-reveal ${stagger}`}
                    style={{ overflow: 'hidden' }}
                  >
                    {/* Date badge */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '1rem',
                        marginBottom: '1.25rem',
                      }}
                    >
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
                        <div
                          style={{
                            fontSize: '1.6rem',
                            fontWeight: 800,
                            color: '#FB3936',
                            lineHeight: 1,
                          }}
                        >
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
                          {typeLabel[ev.type] ?? 'Événement'}
                        </span>
                        <h3
                          style={{
                            fontSize: '1.05rem',
                            fontWeight: 800,
                            color: '#1A1A1A',
                            lineHeight: 1.3,
                          }}
                        >
                          {ev.title}
                        </h3>
                      </div>
                    </div>

                    {/* Meta */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          color: '#7F7F7F',
                          fontSize: '0.82rem',
                        }}
                      >
                        <svg
                          width="13"
                          height="13"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#7F7F7F"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <circle cx="12" cy="12" r="10" />
                          <polyline points="12 6 12 12 16 14" />
                        </svg>
                        <span style={{ textTransform: 'capitalize' }}>
                          {weekday} à {time}
                        </span>
                      </div>
                      {ev.location && (
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            color: '#7F7F7F',
                            fontSize: '0.82rem',
                          }}
                        >
                          <svg
                            width="13"
                            height="13"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#7F7F7F"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
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
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ──────────────────────────────────────── COMMENT REJOINDRE ── */}
      <section style={{ padding: '7rem 1.5rem', background: '#FAFAFA' }}>
        <div style={{ maxWidth: '1040px', margin: '0 auto' }}>
          {/* Header */}
          <div className="sF-reveal" style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <p className="sF-label">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path
                  d="M6 1l1.5 3.5H11L8.3 6.7l1 3.5L6 8l-3.3 2.2 1-3.5L1 4.5h3.5Z"
                  fill="#FB3936"
                />
              </svg>
              Rejoindre l&apos;association
            </p>
            <h2
              style={{
                fontSize: 'clamp(2rem, 5vw, 3.25rem)',
                fontWeight: 800,
                color: '#1A1A1A',
                lineHeight: 1.1,
              }}
            >
              Trois étapes, c&apos;est tout
            </h2>
            <p
              style={{
                marginTop: '0.875rem',
                color: '#7F7F7F',
                fontSize: '1rem',
                maxWidth: '480px',
                margin: '0.875rem auto 0',
                lineHeight: 1.7,
              }}
            >
              Rejoindre La Neuville TAF sa Foulée est simple et rapide. Du formulaire à votre
              première sortie, voici comment ça se passe.
            </p>
          </div>

          {/* Steps */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1.5rem',
            }}
          >
            {/* Step 1 */}
            <div className="sF-card sF-reveal sF-d1" style={{ position: 'relative' }}>
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
                    background: 'rgba(251,57,54,0.1)',
                    border: '1.5px solid rgba(251,57,54,0.18)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
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
                </div>
                <span
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    color: '#FB3936',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                  }}
                >
                  Étape 01
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
                Inscription sur le site
              </h3>
              <p style={{ color: '#7F7F7F', fontSize: '0.875rem', lineHeight: 1.75 }}>
                Inscrivez-vous sur notre site internet en cliquant sur le bouton ci-dessous et
                renseignez les informations demandées.
              </p>
            </div>

            {/* Step 2 */}
            <div className="sF-card sF-reveal sF-d2" style={{ position: 'relative' }}>
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
                    background: 'rgba(192,48,46,0.07)',
                    border: '1.5px solid rgba(192,48,46,0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
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
                </div>
                <span
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    color: '#C0302E',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    opacity: 0.65,
                  }}
                >
                  Étape 02
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
                Validation des informations
              </h3>
              <p style={{ color: '#7F7F7F', fontSize: '0.875rem', lineHeight: 1.75 }}>
                Un formulaire d&apos;inscription va vous être envoyé par e-mail. Veuillez le
                compléter pour finaliser votre dossier.
              </p>
            </div>

            {/* Step 3 */}
            <div className="sF-card sF-reveal sF-d3" style={{ position: 'relative' }}>
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
                    background: 'rgba(169,50,38,0.1)',
                    border: '1.5px solid rgba(169,50,38,0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
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
                </div>
                <span
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    color: '#D42F2D',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                  }}
                >
                  Étape 03
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
                Envoi du dossier
              </h3>
              <p style={{ color: '#7F7F7F', fontSize: '0.875rem', lineHeight: 1.75 }}>
                Une fois complété, retournez-nous votre dossier par e-mail pour finaliser votre
                demande.
              </p>
            </div>
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

      {/* ──────────────────────────────────────── TÉMOIGNAGES ── */}
      <section style={{ padding: '6rem 1.5rem', background: '#E9E2D3' }}>
        <div style={{ maxWidth: '1040px', margin: '0 auto' }}>
          {/* Header */}
          <div className="sF-reveal" style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <h2
              style={{
                fontSize: 'clamp(2rem, 5vw, 3.25rem)',
                fontWeight: 800,
                color: '#1A1A1A',
                lineHeight: 1.1,
              }}
            >
              Pourquoi ?
            </h2>
          </div>

          {/* Testimonials */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1.5rem',
            }}
          >
            {[
              {
                quote:
                  'Passionné de course à pied et profondément attaché à notre beau village de La Neuville, j’ai créé cette association avec une idée simple : rassembler les gens. Mon but était de transformer une pratique souvent solitaire en un moment de partage local.',
                name: 'Albans D.',
                role: 'Président',
                initial: 'A',
                d: 'sF-d1',
              },
              {
                quote:
                  "On m'a parlé de l'association un peu par hasard et j'ai décidé de rejoindre l'aventure. Je n'avais jamais vraiment couru avant, mais j'ai tout de suite adhéré au projet. C’est pour moi une manière idéale de découvrir la course à pied !",
                name: 'Jules B.',
                role: 'Informatique',
                initial: 'J',
                d: 'sF-d2',
              },
              {
                quote:
                  "Je ne suis pas originaire de La Neuville, mais en tant que passionné de course à pieds, j'ai tout de suite suivi mes amis dans l'aventure lors de la création de l'association. C'est le projet parfait pour s'impliquer dans la vie locale tout en pratiquant sa passion.",
                name: 'Matthieu Z.',
                role: 'Démarchage',
                initial: 'M',
                d: 'sF-d3',
              },
            ].map((t) => (
              <div key={t.name} className={`sF-card sF-reveal ${t.d}`}>
                {/* Quote mark */}
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

      {/* ─────────────────────────────────────────── NOTRE ASSOCIATION ── */}
      <section style={{ padding: '7rem 1.5rem', background: '#FAFAFA' }}>
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

            {/* Text */}
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
                pour organiser des événements, accueillir de nouveaux membres et promouvoir la
                course à pied pour tous.
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
                prairies et routes de campagne — avec le clocher et le panneau du village comme
                points de repère fidèles.
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

      {/* ─────────────────────────────────────────── CTA FINAL ── */}
      <section style={{ padding: '7rem 1.5rem', background: '#FAFAFA' }}>
        <div
          className="sF-reveal"
          style={{ maxWidth: '640px', margin: '0 auto', textAlign: 'center' }}
        >
          {/* Decorative three dots */}
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
                  transition: 'all 0.3s ease',
                }}
              />
            ))}
          </div>

          {/* Mascotte CTA */}
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
            Rejoignez La Neuville TAF sa Foulée et découvrez la joie de courir en groupe, sur les
            plus beaux chemins de la région.
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

      {/* ─────────────────────────────────────────── FOOTER ── */}
      <footer
        style={{
          background: '#1A1A1A',
          padding: '3.5rem 1.5rem 2rem',
          color: 'rgba(255,255,255,0.45)',
        }}
      >
        <div style={{ maxWidth: '1040px', margin: '0 auto' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '2rem',
              marginBottom: '2.5rem',
            }}
          >
            {/* Brand */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Image
                src="/logo-removebg-preview.png"
                alt="La Neuville TAF sa Foulée"
                width={44}
                height={44}
                style={{
                  objectFit: 'contain',
                  filter: 'brightness(0) invert(1)',
                  opacity: 0.9,
                  width: 'auto',
                  height: 'auto',
                }}
              />
              <div>
                <div
                  style={{
                    fontSize: '1rem',
                    fontWeight: 800,
                    color: '#FAFAFA',
                    marginBottom: '0.15rem',
                    lineHeight: 1.2,
                  }}
                >
                  La Neuville TAF sa Foulée
                </div>
                <p style={{ fontSize: '0.75rem' }}>Association de course à pied</p>
              </div>
            </div>

            {/* Links */}
            <nav style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
              {[
                { href: '/evenements', label: 'Événements' },
                { href: '/blog', label: 'Blog' },
                { href: '/inscription', label: 'Inscription' },
                { href: '/connexion', label: 'Connexion' },
              ].map((l) => (
                <Link key={l.href} href={l.href} className="sF-flink">
                  {l.label}
                </Link>
              ))}
            </nav>
          </div>

          <div
            style={{
              borderTop: '1px solid rgba(255,255,255,0.07)',
              paddingTop: '1.75rem',
              textAlign: 'center',
              fontSize: '0.78rem',
            }}
          >
            © {new Date().getFullYear()} La Neuville TAF sa Foulée — Tous droits réservés
          </div>
        </div>
      </footer>

      {/* ── Scroll-reveal observer ── */}
      <ScrollReveal />
    </div>
  )
}
