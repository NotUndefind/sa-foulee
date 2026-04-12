import Link from 'next/link'
import Image from 'next/image'

export default function NotFound() {
  return (
    <>
      <style>{`
        @keyframes floatLogo {
          0%, 100% { transform: translateY(0) rotate(-2deg); }
          50%       { transform: translateY(-12px) rotate(2deg); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(22px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        @keyframes trackScroll {
          from { background-position: 0 0;    }
          to   { background-position: 48px 0; }
        }
        .logo-float { animation: floatLogo 4s ease-in-out infinite; }
        .a1 { opacity: 0; animation: fadeUp .65s ease .05s forwards; }
        .a2 { opacity: 0; animation: fadeUp .65s ease .2s  forwards; }
        .a3 { opacity: 0; animation: fadeUp .65s ease .35s forwards; }
        .a4 { opacity: 0; animation: fadeUp .65s ease .5s  forwards; }
        .a5 { opacity: 0; animation: fadeUp .65s ease .65s forwards; }
        .track {
          background-image: repeating-linear-gradient(
            90deg,
            transparent 0, transparent 20px,
            rgba(251,57,54,.18) 20px, rgba(251,57,54,.18) 24px
          );
          animation: trackScroll 1.4s linear infinite;
        }
        .btn-cta {
          transition: transform .2s ease, box-shadow .2s ease, background-color .2s ease;
        }
        .btn-cta:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 36px rgba(251,57,54,.38);
          background-color: #d42f2d;
        }
      `}</style>

      <main
        style={{
          minHeight: '100vh',
          background: '#FAFAFA',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          position: 'relative',
          overflow: 'hidden',
          fontFamily: 'var(--font-geist-sans, system-ui, sans-serif)',
        }}
      >
        {/* ── Ghost 404 watermark ── */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
            userSelect: 'none',
            fontSize: 'clamp(180px, 38vw, 380px)',
            fontWeight: 900,
            letterSpacing: '-0.05em',
            color: 'transparent',
            WebkitTextStroke: '2px rgba(251,57,54,0.055)',
            lineHeight: 1,
          }}
        >
          404
        </div>

        {/* ── Animated track strip ── */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
          }}
        >
          <div className="track" style={{ height: '20px', background: 'rgba(251,57,54,0.05)' }} />
          <div style={{ height: '5px', background: '#FB3936' }} />
        </div>

        {/* ── Content ── */}
        <div
          style={{
            position: 'relative',
            zIndex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
          }}
        >
          {/* Logo */}
          <div className="logo-float a1" style={{ marginBottom: '2.25rem' }}>
            <Image
              src="/logo-removebg-preview.png"
              alt="La Neuville TAF sa Foulée"
              width={148}
              height={148}
              priority
              style={{
                objectFit: 'contain',
                filter: 'drop-shadow(0 8px 28px rgba(251,57,54,0.28))',
              }}
            />
          </div>

          {/* Race bib 404 */}
          <div className="a2" style={{ marginBottom: '2rem' }}>
            <div
              style={{
                display: 'inline-block',
                position: 'relative',
                background: '#FB3936',
                borderRadius: '18px',
                padding: '1.1rem 3rem',
                boxShadow: '0 16px 48px rgba(251,57,54,0.32), inset 0 1px 0 rgba(255,255,255,0.18)',
              }}
            >
              {/* Bib eyelets */}
              {[28, 'calc(100% - 44px)'].map((left, i) => (
                <div
                  key={i}
                  aria-hidden
                  style={{
                    position: 'absolute',
                    top: '-9px',
                    left: typeof left === 'number' ? `${left}px` : left,
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    background: '#FAFAFA',
                    border: '2.5px solid rgba(251,57,54,0.25)',
                    boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.08)',
                  }}
                />
              ))}

              <span
                style={{
                  display: 'block',
                  fontSize: 'clamp(3.75rem, 12vw, 6.5rem)',
                  fontWeight: 900,
                  color: '#FFFFFF',
                  letterSpacing: '-0.05em',
                  lineHeight: 1,
                }}
              >
                404
              </span>

              <span
                style={{
                  display: 'block',
                  marginTop: '0.3rem',
                  fontSize: '0.6rem',
                  fontWeight: 700,
                  letterSpacing: '0.22em',
                  textTransform: 'uppercase',
                  color: 'rgba(255,255,255,0.65)',
                }}
              >
                Page non trouvée
              </span>
            </div>
          </div>

          {/* Heading */}
          <h1
            className="a3"
            style={{
              fontSize: 'clamp(1.5rem, 4.5vw, 2.25rem)',
              fontWeight: 800,
              color: '#1A1A1A',
              lineHeight: 1.15,
              marginBottom: '0.9rem',
            }}
          >
            Vous avez pris un mauvais virage&nbsp;!
          </h1>

          {/* Subtitle */}
          <p
            className="a4"
            style={{
              color: '#7F7F7F',
              fontSize: '1rem',
              lineHeight: 1.75,
              maxWidth: '360px',
              marginBottom: '2.5rem',
            }}
          >
            Cette page n&apos;est pas sur le parcours. Retournez à la ligne de départ et reprenez
            votre élan.
          </p>

          {/* CTA */}
          <Link
            href="/"
            className="btn-cta a5"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: '#FB3936',
              color: '#fff',
              padding: '0.9rem 2.1rem',
              borderRadius: '100px',
              fontWeight: 700,
              fontSize: '0.95rem',
              textDecoration: 'none',
              boxShadow: '0 4px 22px rgba(251,57,54,0.28)',
            }}
          >
            Retour à l&apos;accueil
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path
                d="M3 8h10M9.5 4l4 4-4 4"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        </div>
      </main>
    </>
  )
}
