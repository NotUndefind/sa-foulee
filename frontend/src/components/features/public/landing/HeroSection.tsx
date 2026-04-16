import Image from 'next/image'
import Link from 'next/link'

export default function HeroSection() {
  return (
    <section
      className="sF-hero-section"
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
      {/* Formes décoratives animées — desktop uniquement */}
      <div
        className="hidden md:block"
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
        className="hidden md:block"
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
        className="hidden md:block"
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
        className="hidden md:block"
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

      {/* Mascotte flottante — desktop uniquement */}
      <div
        className="sF-deco hidden md:block"
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

      {/* Ligne SVG animée — desktop uniquement */}
      <svg
        className="hidden md:block"
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

      {/* Dot grid — desktop uniquement */}
      <svg
        className="hidden md:block"
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

      {/* Contenu */}
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

        {/* Titre principal */}
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
              fontSize: 'clamp(2.5rem, 14vw, 10rem)',
              fontWeight: 800,
              color: '#FB3936',
              letterSpacing: '-0.03em',
              lineHeight: 0.88,
            }}
          >
            sa Foulée
          </span>
        </h1>

        {/* Sous-titre */}
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
        <div className="sF-cta flex flex-col items-center justify-center gap-3 md:flex-row">
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
          <a href="#decouvrir" className="sF-btn-ghost hidden md:inline-flex">
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
  )
}
