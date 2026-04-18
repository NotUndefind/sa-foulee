import type { Metadata } from 'next'
import { Baloo_2 } from 'next/font/google'
import Image from 'next/image'
import Link from 'next/link'

import ScrollReveal from '@/components/ui/ScrollReveal'

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

  let homepageStats = { member_count: 7, total_km: 0 }
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
    <div className={`${baloo.className} bg-sf-cream min-h-screen`}>
      {/* ─────────────────────────────────────────── HERO ── */}
      <section
        className="relative flex flex-col justify-center overflow-hidden px-6 pt-20 pb-32"
        style={{
          minHeight: 'calc(100vh - 68px)',
          background: 'linear-gradient(150deg, #FAFAFA 0%, #F5F0EB 60%, #FAF0EE 100%)',
        }}
      >
        {/* Formes décoratives animées */}
        <div
          className="absolute pointer-events-none rounded-full"
          style={{
            right: '-10%',
            top: '5%',
            width: '55vw',
            height: '55vw',
            maxWidth: '680px',
            maxHeight: '680px',
            background: 'radial-gradient(circle, rgba(251,57,54,0.06) 0%, transparent 70%)',
            animation: 'sF-blob 9s ease-in-out infinite',
          }}
        />
        <div
          className="absolute pointer-events-none rounded-full"
          style={{
            left: '-8%',
            bottom: '5%',
            width: '38vw',
            height: '38vw',
            maxWidth: '440px',
            maxHeight: '440px',
            background: 'radial-gradient(circle, rgba(251,57,54,0.05) 0%, transparent 70%)',
            animation: 'sF-blob 12s ease-in-out infinite reverse',
            animationDelay: '2s',
          }}
        />
        <div
          className="absolute pointer-events-none rounded-full"
          style={{
            left: '30%',
            top: '-12%',
            width: '28vw',
            height: '28vw',
            maxWidth: '320px',
            maxHeight: '320px',
            background: 'radial-gradient(circle, rgba(192,48,46,0.04) 0%, transparent 70%)',
            animation: 'sF-blob 15s ease-in-out infinite',
            animationDelay: '4s',
          }}
        />
        <div
          className="absolute pointer-events-none rounded-full"
          style={{
            right: '25%',
            bottom: '-8%',
            width: '20vw',
            height: '20vw',
            maxWidth: '240px',
            maxHeight: '240px',
            background: 'radial-gradient(circle, rgba(251,57,54,0.05) 0%, transparent 70%)',
            animation: 'sF-blob 10s ease-in-out infinite reverse',
            animationDelay: '1s',
          }}
        />

        {/* Mascotte flottante */}
        <div
          className="sF-deco absolute pointer-events-none"
          style={{ right: '4%', top: '50%', transform: 'translateY(-50%)' }}
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
          className="absolute bottom-0 left-0 w-full opacity-[0.18]"
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
          className="absolute pointer-events-none opacity-[0.12]"
          style={{ left: '3%', top: '12%' }}
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
        <div className="relative z-[2] max-w-[780px] mx-auto text-center">
          {/* Badge */}
          <div
            className="sF-tag inline-flex items-center gap-2 mb-8 rounded-[100px]"
            style={{
              background: 'rgba(251,57,54,0.07)',
              color: '#C0302E',
              padding: '0.4rem 1.1rem',
              fontSize: '0.85rem',
              fontWeight: 700,
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
            }}
          >
            L&apos;association de course à pied de votre village — ouverte à tous, portée par la
            passion du trail et la convivialité.
          </p>

          {/* CTAs */}
          <div className="sF-cta flex gap-4 justify-center flex-wrap">
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
      <section id="decouvrir" className="px-6 py-28 bg-sf-cream">
        <div className="max-w-[1040px] mx-auto">
          <div className="sF-reveal text-center mb-14">
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

          <div
            className="grid gap-6"
            style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))' }}
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
                <div
                  className="flex items-center justify-center mb-[1.4rem] rounded-[14px]"
                  style={{
                    width: '52px',
                    height: '52px',
                    background: `${v.accent}12`,
                    fontSize: '1.6rem',
                    border: `1.5px solid ${v.accent}18`,
                  }}
                >
                  {v.emoji}
                </div>
                <h3
                  className="font-extrabold mb-[0.4rem]"
                  style={{ fontSize: '1.25rem', color: '#1A1A1A' }}
                >
                  {v.title}
                </h3>
                <p
                  className="font-bold mb-[0.85rem]"
                  style={{ color: v.accent, fontSize: '0.9rem', lineHeight: 1.4 }}
                >
                  {v.punch}
                </p>
                <p style={{ color: '#7F7F7F', fontSize: '0.875rem', lineHeight: 1.75 }}>
                  {v.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────── ACTIVITÉS ── */}
      <section className="px-6 py-24 bg-[#E9E2D3]">
        <div className="max-w-[1040px] mx-auto">
          <div className="sF-reveal flex items-end justify-between flex-wrap gap-6 mb-12">
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
                  <path
                    d="M4 6h4M6 4v4"
                    stroke="#FB3936"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
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
              className="inline-flex items-center gap-[0.4rem] font-semibold no-underline"
              style={{
                color: '#C0302E',
                fontSize: '0.9rem',
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
            className="grid gap-5"
            style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(285px, 1fr))' }}
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
                <div className="flex items-center gap-3 mb-5">
                  <span
                    className="font-extrabold uppercase"
                    style={{ fontSize: '0.75rem', color: '#FB3936', letterSpacing: '0.08em' }}
                  >
                    {a.num}
                  </span>
                  <div className="h-px flex-1" style={{ background: 'rgba(192,48,46,0.15)' }} />
                  <span style={{ fontSize: '1.25rem' }}>{a.emoji}</span>
                </div>
                <h3
                  className="font-extrabold mb-[0.7rem]"
                  style={{ fontSize: '1.1rem', color: '#1A1A1A' }}
                >
                  {a.title}
                </h3>
                <p style={{ color: '#7F7F7F', fontSize: '0.875rem', lineHeight: 1.75 }}>
                  {a.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────── STATS ── */}
      <section className="relative overflow-hidden px-6 py-24 bg-[#F5F0EB]">
        <div
          className="absolute pointer-events-none rounded-full border border-[rgba(192,48,46,0.06)]"
          style={{
            right: '-5%',
            top: '-20%',
            width: '45vw',
            height: '45vw',
            maxWidth: '500px',
            maxHeight: '500px',
          }}
        />
        <div
          className="absolute pointer-events-none rounded-full border border-[rgba(192,48,46,0.04)]"
          style={{
            right: '5%',
            top: '-10%',
            width: '30vw',
            height: '30vw',
            maxWidth: '340px',
            maxHeight: '340px',
          }}
        />

        <div className="relative z-[2] max-w-[1040px] mx-auto">
          <div className="sF-reveal text-center mb-16">
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

          <div
            className="grid gap-2"
            style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}
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
                num: `${String(homepageStats.total_km)} km`,
                label: 'parcourus',
                sub: 'performances totales',
                d: 'sF-d3',
              },
            ].map((s) => (
              <div
                key={s.label}
                className={`sF-reveal ${s.d} text-center rounded-[18px]`}
                style={{
                  padding: '2.5rem 1.5rem',
                  background: 'rgba(255,255,255,0.7)',
                  border: '1px solid rgba(192,48,46,0.08)',
                }}
              >
                <div
                  className="font-extrabold leading-none mb-[0.6rem]"
                  style={{ fontSize: 'clamp(3.5rem, 9vw, 5.5rem)', color: '#C0302E' }}
                >
                  {s.num}
                </div>
                <div
                  className="font-bold mb-[0.3rem]"
                  style={{ color: '#1A1A1A', fontSize: '1.05rem' }}
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
        <section className="px-6 py-28 bg-sf-cream">
          <div className="max-w-[1040px] mx-auto">
            <div className="sF-reveal text-center mb-14">
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
                className="mt-[0.875rem] mx-auto"
                style={{ color: '#7F7F7F', fontSize: '1rem', maxWidth: '480px', lineHeight: 1.7 }}
              >
                Rejoignez-nous sur les prochains événements et partagez la route avec
                l&apos;association.
              </p>
            </div>

            <div
              className="grid gap-6 mb-10"
              style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}
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
                  <div key={ev.id} className={`sF-card sF-reveal ${stagger} overflow-hidden`}>
                    <div className="flex items-start gap-4 mb-5">
                      <div
                        className="shrink-0 text-center rounded-[12px]"
                        style={{
                          width: '52px',
                          background: 'rgba(251,57,54,0.07)',
                          padding: '0.5rem 0.25rem',
                          border: '1.5px solid rgba(251,57,54,0.14)',
                        }}
                      >
                        <div
                          className="font-extrabold leading-none"
                          style={{ fontSize: '1.6rem', color: '#FB3936' }}
                        >
                          {day}
                        </div>
                        <div
                          className="font-bold uppercase"
                          style={{
                            fontSize: '0.65rem',
                            color: '#FB3936',
                            letterSpacing: '0.06em',
                          }}
                        >
                          {month}
                        </div>
                      </div>
                      <div className="flex-1">
                        <span
                          className="inline-block font-extrabold uppercase rounded-[999px] mb-[0.35rem]"
                          style={{
                            fontSize: '0.65rem',
                            color,
                            letterSpacing: '0.1em',
                            background: `${color}14`,
                            padding: '0.2rem 0.6rem',
                          }}
                        >
                          {typeLabel[ev.type] ?? 'Événement'}
                        </span>
                        <h3
                          className="font-extrabold"
                          style={{ fontSize: '1.05rem', color: '#1A1A1A', lineHeight: 1.3 }}
                        >
                          {ev.title}
                        </h3>
                      </div>
                    </div>

                    <div className="flex flex-col gap-[0.45rem]">
                      <div
                        className="flex items-center gap-2"
                        style={{ color: '#7F7F7F', fontSize: '0.82rem' }}
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
                        <span className="capitalize">
                          {weekday} à {time}
                        </span>
                      </div>
                      {ev.location && (
                        <div
                          className="flex items-center gap-2"
                          style={{ color: '#7F7F7F', fontSize: '0.82rem' }}
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

            <div className="sF-reveal sF-d3 text-center">
              <Link
                href="/activites"
                className="inline-flex items-center gap-2 font-bold no-underline"
                style={{
                  color: '#FB3936',
                  fontSize: '0.95rem',
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
      <section className="px-6 py-28 bg-sf-cream">
        <div className="max-w-[1040px] mx-auto">
          <div className="sF-reveal text-center mb-16">
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
              className="mt-[0.875rem] mx-auto"
              style={{ color: '#7F7F7F', fontSize: '1rem', maxWidth: '480px', lineHeight: 1.7 }}
            >
              Rejoindre La Neuville TAF sa Foulée est simple et rapide. Du formulaire à votre
              première sortie, voici comment ça se passe.
            </p>
          </div>

          <div
            className="grid gap-6"
            style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}
          >
            {/* Step 1 */}
            <div className="sF-card sF-reveal sF-d1 relative">
              <div className="flex items-center gap-4 mb-6">
                <div
                  className="flex items-center justify-center shrink-0 rounded-[12px]"
                  style={{
                    width: '44px',
                    height: '44px',
                    background: 'rgba(251,57,54,0.1)',
                    border: '1.5px solid rgba(251,57,54,0.18)',
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
                  className="font-extrabold uppercase"
                  style={{ fontSize: '0.7rem', color: '#FB3936', letterSpacing: '0.1em' }}
                >
                  Étape 01
                </span>
              </div>
              <h3
                className="font-extrabold mb-[0.6rem]"
                style={{ fontSize: '1.2rem', color: '#1A1A1A' }}
              >
                Inscription sur le site
              </h3>
              <p style={{ color: '#7F7F7F', fontSize: '0.875rem', lineHeight: 1.75 }}>
                Inscrivez-vous sur notre site internet en cliquant sur le bouton ci-dessous et
                renseignez les informations demandées.
              </p>
            </div>

            {/* Step 2 */}
            <div className="sF-card sF-reveal sF-d2 relative">
              <div className="flex items-center gap-4 mb-6">
                <div
                  className="flex items-center justify-center shrink-0 rounded-[12px]"
                  style={{
                    width: '44px',
                    height: '44px',
                    background: 'rgba(192,48,46,0.07)',
                    border: '1.5px solid rgba(192,48,46,0.12)',
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
                  className="font-extrabold uppercase opacity-65"
                  style={{ fontSize: '0.7rem', color: '#C0302E', letterSpacing: '0.1em' }}
                >
                  Étape 02
                </span>
              </div>
              <h3
                className="font-extrabold mb-[0.6rem]"
                style={{ fontSize: '1.2rem', color: '#1A1A1A' }}
              >
                Validation des informations
              </h3>
              <p style={{ color: '#7F7F7F', fontSize: '0.875rem', lineHeight: 1.75 }}>
                Un formulaire d&apos;inscription va vous être envoyé par e-mail. Veuillez le
                compléter pour finaliser votre dossier.
              </p>
            </div>

            {/* Step 3 */}
            <div className="sF-card sF-reveal sF-d3 relative">
              <div className="flex items-center gap-4 mb-6">
                <div
                  className="flex items-center justify-center shrink-0 rounded-[12px]"
                  style={{
                    width: '44px',
                    height: '44px',
                    background: 'rgba(169,50,38,0.1)',
                    border: '1.5px solid rgba(169,50,38,0.15)',
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
                  className="font-extrabold uppercase"
                  style={{ fontSize: '0.7rem', color: '#D42F2D', letterSpacing: '0.1em' }}
                >
                  Étape 03
                </span>
              </div>
              <h3
                className="font-extrabold mb-[0.6rem]"
                style={{ fontSize: '1.2rem', color: '#1A1A1A' }}
              >
                Envoi du dossier
              </h3>
              <p style={{ color: '#7F7F7F', fontSize: '0.875rem', lineHeight: 1.75 }}>
                Une fois complété, retournez-nous votre dossier par e-mail pour finaliser votre
                demande.
              </p>
            </div>
          </div>

          <div className="sF-reveal text-center mt-14">
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
      <section className="px-6 py-24 bg-[#E9E2D3]">
        <div className="max-w-[1040px] mx-auto">
          <div className="sF-reveal text-center mb-14">
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

          <div
            className="grid gap-6"
            style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}
          >
            {[
              {
                quote:
                  'Passionné de course à pied et profondément attaché à notre beau village de La Neuville, j'ai créé cette association avec une idée simple : rassembler les gens. Mon but était de transformer une pratique souvent solitaire en un moment de partage local.',
                name: 'Albans D.',
                role: 'Président',
                initial: 'A',
                d: 'sF-d1',
              },
              {
                quote:
                  "On m'a parlé de l'association un peu par hasard et j'ai décidé de rejoindre l'aventure. Je n'avais jamais vraiment couru avant, mais j'ai tout de suite adhéré au projet. C'est pour moi une manière idéale de découvrir la course à pied !",
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
                <div className="mb-5">
                  <svg width="28" height="22" viewBox="0 0 28 22" fill="none">
                    <path
                      d="M0 22V13.2C0 5.73 4.2 1.4 12.6 0l1.4 2.52C9.8 3.36 7.56 5.18 6.86 8H12V22H0zm16 0V13.2C16 5.73 20.2 1.4 28.6 0L30 2.52C25.8 3.36 23.56 5.18 22.86 8H28V22H16z"
                      fill="#C0302E"
                      fillOpacity="0.12"
                    />
                  </svg>
                </div>
                <p
                  className="italic mb-6"
                  style={{ color: '#3A4A2E', fontSize: '0.925rem', lineHeight: 1.8 }}
                >
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div
                  className="flex items-center gap-3 pt-4"
                  style={{ borderTop: '1px solid rgba(192,48,46,0.08)' }}
                >
                  <div
                    className="flex items-center justify-center shrink-0 rounded-full font-bold"
                    style={{
                      width: '36px',
                      height: '36px',
                      background: 'rgba(251,57,54,0.12)',
                      fontSize: '0.85rem',
                      color: '#FB3936',
                    }}
                  >
                    {t.initial}
                  </div>
                  <div>
                    <p className="font-bold" style={{ color: '#1A1A1A', fontSize: '0.875rem' }}>
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
      <section className="px-6 py-28 bg-sf-cream">
        <div className="max-w-[1040px] mx-auto">
          <div
            className="grid gap-14 items-center"
            style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}
          >
            {/* Photo */}
            <div className="sF-reveal relative">
              <div
                className="rounded-[24px] overflow-hidden"
                style={{
                  boxShadow: '0 24px 64px rgba(192,48,46,0.13)',
                  border: '1.5px solid rgba(192,48,46,0.08)',
                }}
              >
                <Image
                  src="/bureau.png"
                  alt="Les membres du bureau de La Neuville TAF sa Foulée devant le panneau du village"
                  width={540}
                  height={380}
                  className="w-full h-auto block"
                />
              </div>
              <div
                className="absolute right-6 rounded-[14px] font-bold text-white"
                style={{
                  bottom: '-1rem',
                  background: '#FB3936',
                  padding: '0.6rem 1.1rem',
                  fontSize: '0.78rem',
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
                className="mb-5"
                style={{
                  fontSize: 'clamp(2rem, 5vw, 3rem)',
                  fontWeight: 800,
                  color: '#1A1A1A',
                  lineHeight: 1.1,
                }}
              >
                Une équipe passionnée,
                <br />
                <span style={{ color: '#FB3936' }}>au cœur du village</span>
              </h2>
              <p className="mb-5" style={{ color: '#7F7F7F', fontSize: '0.95rem', lineHeight: 1.8 }}>
                La Neuville TAF sa Foulée est une association à but non lucratif fondée par des
                coureurs du village. Notre bureau, composé de bénévoles engagés, œuvre chaque année
                pour organiser des événements, accueillir de nouveaux membres et promouvoir la
                course à pied pour tous.
              </p>
              <p className="mb-8" style={{ color: '#7F7F7F', fontSize: '0.95rem', lineHeight: 1.8 }}>
                Implantés à La Neuville, nous courons sur les chemins de notre territoire — forêts,
                prairies et routes de campagne — avec le clocher et le panneau du village comme
                points de repère fidèles.
              </p>
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
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────── CTA FINAL ── */}
      <section className="px-6 py-28 bg-sf-cream">
        <div className="sF-reveal max-w-[640px] mx-auto text-center">
          <div className="flex justify-center gap-2 mb-9">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-2 rounded-[100px] transition-all duration-300"
                style={{
                  width: i === 1 ? '32px' : '8px',
                  background: i === 1 ? '#FB3936' : '#C0302E',
                  opacity: i === 1 ? 1 : 0.2,
                }}
              />
            ))}
          </div>

          <div className="mb-8">
            <Image
              src="/mascotte-removebg-preview.png"
              alt="Mascotte de La Neuville TAF sa Foulée"
              width={120}
              height={120}
              className="mx-auto block w-auto h-auto"
              style={{ objectFit: 'contain' }}
            />
          </div>

          <h2
            className="mb-5"
            style={{
              fontSize: 'clamp(2.25rem, 6vw, 4rem)',
              fontWeight: 800,
              color: '#1A1A1A',
              lineHeight: 1.05,
            }}
          >
            Prêt à courir <span style={{ color: '#FB3936' }}>avec nous ?</span>
          </h2>

          <p
            className="mx-auto mb-11"
            style={{
              color: '#7F7F7F',
              fontSize: '1.05rem',
              lineHeight: 1.75,
              maxWidth: '460px',
            }}
          >
            Rejoignez La Neuville TAF sa Foulée et découvrez la joie de courir en groupe, sur les
            plus beaux chemins de la région.
          </p>

          <div className="flex gap-4 justify-center flex-wrap">
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
      <footer className="bg-sf-bark px-6 pt-14 pb-8" style={{ color: 'rgba(255,255,255,0.45)' }}>
        <div className="max-w-[1040px] mx-auto">
          <div className="flex items-center justify-between flex-wrap gap-8 mb-10">
            <div className="flex items-center gap-3">
              <Image
                src="/logo-removebg-preview.png"
                alt="La Neuville TAF sa Foulée"
                width={44}
                height={44}
                className="w-auto h-auto opacity-90"
                style={{ objectFit: 'contain', filter: 'brightness(0) invert(1)' }}
              />
              <div>
                <div
                  className="font-extrabold leading-tight mb-[0.15rem]"
                  style={{ fontSize: '1rem', color: '#FAFAFA' }}
                >
                  La Neuville TAF sa Foulée
                </div>
                <p style={{ fontSize: '0.75rem' }}>Association de course à pied</p>
              </div>
            </div>

            <nav className="flex gap-8 flex-wrap">
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
            className="text-center"
            style={{
              borderTop: '1px solid rgba(255,255,255,0.07)',
              paddingTop: '1.75rem',
              fontSize: '0.78rem',
            }}
          >
            © {new Date().getFullYear()} La Neuville TAF sa Foulée — Tous droits réservés
          </div>
        </div>
      </footer>

      <ScrollReveal />
    </div>
  )
}
