'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/auth.store'
import { api } from '@/lib/api'
import type { Event, TrainingSession, Post } from '@/types'

// ── Helpers ────────────────────────────────────────────────────────────────────

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Bonjour'
  if (h < 18) return 'Bon après-midi'
  return 'Bonsoir'
}

function quote() {
  const h = new Date().getHours()
  if (h < 12) return 'Une belle foulée commence par un premier pas.'
  if (h < 18) return "L'énergie de l'après-midi, c'est votre carburant."
  return 'Chaque kilomètre parcouru vous rapproche de votre objectif.'
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    weekday: 'short', day: 'numeric', month: 'long',
  })
}

function formatDateShort(dateStr: string) {
  const d = new Date(dateStr)
  return {
    day:     d.getDate(),
    month:   d.toLocaleDateString('fr-FR', { month: 'short' }),
    weekday: d.toLocaleDateString('fr-FR', { weekday: 'short' }),
  }
}

const EVENT_TYPE_LABEL: Record<string, string> = {
  race: 'Course', outing: 'Sortie', competition: 'Compétition', other: 'Autre',
}
const EVENT_TYPE_COLOR: Record<string, string> = {
  race: '#FB3936', outing: '#7F7F7F', competition: '#f59e0b', other: '#D42F2D',
}

const SESSION_TYPE_LABEL: Record<string, string> = {
  running: 'Footing', interval: 'Fractionné', fartlek: 'Fartlek',
  recovery: 'Récupération', strength: 'Renforcement', other: 'Autre',
}

const INTENSITY_CONFIG: Record<string, { label: string; bg: string; color: string }> = {
  low:    { label: 'Facile',  bg: 'rgba(176,137,138,0.15)', color: '#D42F2D' },
  medium: { label: 'Modéré', bg: 'rgba(245,158,11,0.12)',  color: '#d97706' },
  high:   { label: 'Intense', bg: 'rgba(251,57,54,0.12)',  color: '#FB3936' },
}

// ── SVG Icons ──────────────────────────────────────────────────────────────────

function IconCalendar() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  )
}

function IconRun() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="15" cy="4" r="2" />
      <path d="M10.5 8.5L8 17l4-2 3 4 2-8" />
      <path d="M16 8l-2.5.5-3 5" />
      <path d="M5 12l3.5 1" />
    </svg>
  )
}

function IconTrophy() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 21h8M12 17v4" />
      <path d="M7 4H4v3a5 5 0 0 0 5 5h6a5 5 0 0 0 5-5V4h-3" />
      <path d="M7 4h10M4 7H2M20 7h2" />
    </svg>
  )
}

function IconPen() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
    </svg>
  )
}

function IconMapPin() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
    </svg>
  )
}

function IconEmptyCalendar() {
  return (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  )
}

function IconEmptyRun() {
  return (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="15" cy="4" r="2" /><path d="M10.5 8.5L8 17l4-2 3 4 2-8" />
      <path d="M16 8l-2.5.5-3 5" /><path d="M5 12l3.5 1" />
    </svg>
  )
}

function IconEmptyPost() {
  return (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
    </svg>
  )
}

function IconPin() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="17" x2="12" y2="22" /><path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z" />
    </svg>
  )
}

// ── Skeleton ───────────────────────────────────────────────────────────────────

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-zinc-100 ${className ?? ''}`} />
}

// ── Empty State ────────────────────────────────────────────────────────────────

function EmptyState({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex flex-col items-center gap-2 py-8 text-center" style={{ color: 'rgba(192,48,46,0.2)' }}>
      {icon}
      <p className="text-sm" style={{ color: 'rgba(192,48,46,0.45)' }}>{label}</p>
    </div>
  )
}

// ── Section Header ─────────────────────────────────────────────────────────────

function SectionHeader({ title, href, accent }: { title: string; href: string; accent: string }) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="h-4 w-1 rounded-full" style={{ background: accent }} />
        <h2 className="text-base font-bold" style={{ color: '#C0302E', fontFamily: "'Baloo 2', sans-serif" }}>
          {title}
        </h2>
      </div>
      <Link
        href={href}
        className="text-xs font-semibold transition-colors hover:underline"
        style={{ color: accent, fontFamily: "'Baloo 2', sans-serif" }}
      >
        Voir tout →
      </Link>
    </div>
  )
}

// ── Quick Action ──────────────────────────────────────────────────────────────

const QUICK_ACTIONS = [
  { Icon: IconCalendar, label: 'Événements',  href: '/tableau-de-bord/evenements',  desc: 'Courses & sorties',   accent: '#FB3936', bg: 'rgba(251,57,54,0.08)'  },
  { Icon: IconRun,      label: 'Sessions',    href: '/tableau-de-bord/sessions',    desc: 'Entraînements',       accent: '#D42F2D', bg: 'rgba(192,48,46,0.07)'   },
  { Icon: IconTrophy,   label: 'Classement',  href: '/tableau-de-bord/leaderboard', desc: 'Mes performances',    accent: '#d97706', bg: 'rgba(245,158,11,0.07)' },
  { Icon: IconPen,      label: 'Blog',        href: '/tableau-de-bord/blog',        desc: 'Actualités',  accent: '#7F7F7F', bg: 'rgba(176,137,138,0.09)'},
]

// ── Page ───────────────────────────────────────────────────────────────────────

export default function DashboardHomePage() {
  const { user } = useAuthStore()

  const [events,   setEvents]   = useState<Event[]>([])
  const [sessions, setSessions] = useState<TrainingSession[]>([])
  const [posts,    setPosts]    = useState<Post[]>([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const [eventsRes, sessionsRes, postsRes] = await Promise.allSettled([
          api.get<{ data: Event[] }>('/events?per_page=4'),
          api.get<{ data: TrainingSession[] }>('/sessions?per_page=4'),
          api.get<{ data: Post[] }>('/posts?per_page=3'),
        ])
        if (eventsRes.status   === 'fulfilled') setEvents(eventsRes.value?.data ?? [])
        if (sessionsRes.status === 'fulfilled') setSessions(sessionsRes.value?.data ?? [])
        if (postsRes.status    === 'fulfilled') setPosts(postsRes.value?.data ?? [])
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const today = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
  const completionPct = user?.document_completion ?? 0

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@400;500;600;700;800&display=swap');

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-8px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes progressFill { from { width: 0%; } }

        .sf-page { font-family: 'Baloo 2', sans-serif; }
        .sf-fade { animation: fadeUp 0.45s ease both; }
        .sf-slide { animation: slideIn 0.35s ease both; }

        .sf-card {
          background: white;
          border-radius: 16px;
          box-shadow: 0 2px 8px rgba(192,48,46,0.07);
          border: 1px solid rgba(192,48,46,0.08);
          overflow: hidden;
          transition: box-shadow 0.2s ease, transform 0.2s ease;
        }
        .sf-card:hover {
          box-shadow: 0 6px 20px rgba(192,48,46,0.12);
          transform: translateY(-1px);
        }

        .sf-quick-card {
          background: white;
          border-radius: 14px;
          border: 1px solid rgba(192,48,46,0.07);
          box-shadow: 0 1px 4px rgba(192,48,46,0.05);
          padding: 16px;
          transition: all 0.2s ease;
          text-decoration: none;
          display: block;
        }
        .sf-quick-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(192,48,46,0.12);
        }

        .sf-progress-bar { animation: progressFill 0.8s ease 0.3s both; }
        .sf-event-row { transition: background 0.15s ease; }
        .sf-event-row:hover { background: rgba(192,48,46,0.02); }
        .sf-blog-card { transition: all 0.2s ease; }
        .sf-blog-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(192,48,46,0.1);
        }
      `}</style>

      <div className="sf-page min-h-screen pb-24 lg:pb-8" style={{ background: '#F8F8F8' }}>
        <div className="mx-auto max-w-5xl px-5 py-8">

          {/* ── Hero Header ────────────────────────────────────────────── */}
          <div className="sf-fade mb-8" style={{ animationDelay: '0ms' }}>
            <p className="mb-1 text-xs font-semibold uppercase tracking-widest capitalize" style={{ color: 'rgba(192,48,46,0.4)' }}>
              {today}
            </p>
            <h1 className="text-3xl font-extrabold leading-tight" style={{ letterSpacing: '-0.02em', color: '#C0302E' }}>
              {greeting()}{user?.first_name ? (
                <>
                  {', '}
                  <span style={{ color: '#FB3936' }}>{user.first_name}</span>
                </>
              ) : ''} !
            </h1>
            <p className="mt-1.5 text-sm italic" style={{ color: 'rgba(192,48,46,0.5)' }}>
              « {quote()} »
            </p>
          </div>

          {/* ── Document banner ─────────────────────────────────────────── */}
          {completionPct < 100 && (
            <Link
              href="/tableau-de-bord/profil"
              className="sf-fade mb-6 flex items-center gap-4 rounded-2xl px-5 py-4 transition-all hover:opacity-90"
              style={{
                animationDelay: '60ms',
                background: 'linear-gradient(135deg, #fff7ed 0%, #fef3c7 100%)',
                border: '1px solid #fde68a',
              }}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ background: 'rgba(245,158,11,0.15)' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-amber-800">
                  Dossier incomplet — {completionPct}% complété
                </p>
                <p className="mt-0.5 text-xs text-amber-600">
                  Complétez votre dossier pour participer aux événements de l&apos;association.
                </p>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-amber-200">
                  <div
                    className="sf-progress-bar h-full rounded-full"
                    style={{ width: `${completionPct}%`, background: 'linear-gradient(90deg, #f59e0b, #d97706)' }}
                  />
                </div>
              </div>
              <span className="shrink-0 text-xs font-bold text-amber-700">Compléter →</span>
            </Link>
          )}

          {/* ── Quick Actions ───────────────────────────────────────────── */}
          <div className="sf-fade mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4" style={{ animationDelay: '100ms' }}>
            {QUICK_ACTIONS.map(({ Icon, label, href, desc, accent, bg }, i) => (
              <Link
                key={href}
                href={href}
                className="sf-quick-card"
                style={{ animationDelay: `${120 + i * 40}ms` }}
              >
                <div
                  className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl"
                  style={{ background: bg, color: accent }}
                >
                  <Icon />
                </div>
                <p className="text-sm font-bold" style={{ color: '#C0302E' }}>{label}</p>
                <p className="mt-0.5 text-xs" style={{ color: accent }}>{desc}</p>
              </Link>
            ))}
          </div>

          {/* ── Two columns: events + sessions ─────────────────────────── */}
          <div className="mb-6 grid gap-5 lg:grid-cols-2">

            {/* Événements */}
            <div className="sf-fade" style={{ animationDelay: '220ms' }}>
              <SectionHeader title="Prochains événements" href="/tableau-de-bord/evenements" accent="#FB3936" />
              <div className="sf-card">
                {loading ? (
                  <div className="space-y-0 divide-y" style={{ borderColor: 'rgba(192,48,46,0.04)' }}>
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center gap-3 px-5 py-4">
                        <Skeleton className="h-12 w-10 shrink-0" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-3.5 w-3/4" />
                          <Skeleton className="h-3 w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : events.length === 0 ? (
                  <EmptyState icon={<IconEmptyCalendar />} label="Aucun événement à venir" />
                ) : (
                  <div className="divide-y" style={{ borderColor: 'rgba(192,48,46,0.05)' }}>
                    {events.map((ev, i) => {
                      const { day, month, weekday } = formatDateShort(ev.event_date)
                      const typeColor = EVENT_TYPE_COLOR[ev.type] ?? '#D42F2D'
                      return (
                        <Link
                          key={ev.id}
                          href="/tableau-de-bord/evenements"
                          className="sf-event-row sf-slide flex items-center gap-3 px-5 py-3.5"
                          style={{ animationDelay: `${240 + i * 60}ms` }}
                        >
                          {/* Date badge */}
                          <div
                            className="flex h-12 w-10 shrink-0 flex-col items-center justify-center rounded-xl text-center"
                            style={{ background: `${typeColor}12`, border: `1px solid ${typeColor}22` }}
                          >
                            <span className="text-xs font-medium uppercase leading-none" style={{ color: typeColor, opacity: 0.8 }}>
                              {weekday}
                            </span>
                            <span className="text-lg font-extrabold leading-tight" style={{ color: typeColor }}>
                              {day}
                            </span>
                            <span className="text-[9px] uppercase" style={{ color: typeColor, opacity: 0.7 }}>
                              {month}
                            </span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold" style={{ color: '#C0302E' }}>{ev.title}</p>
                            <p className="mt-0.5 flex items-center gap-1.5 text-xs" style={{ color: 'rgba(192,48,46,0.45)' }}>
                              <span
                                className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                                style={{ background: `${typeColor}15`, color: typeColor }}
                              >
                                {EVENT_TYPE_LABEL[ev.type] ?? ev.type}
                              </span>
                              {ev.location && (
                                <span className="flex items-center gap-0.5 truncate">
                                  <IconMapPin /> {ev.location}
                                </span>
                              )}
                            </p>
                          </div>
                          {ev.is_registered && (
                            <span
                              className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold"
                              style={{ background: 'rgba(192,48,46,0.08)', color: '#D42F2D' }}
                            >
                              Inscrit
                            </span>
                          )}
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Sessions */}
            <div className="sf-fade" style={{ animationDelay: '260ms' }}>
              <SectionHeader title="Prochaines sessions" href="/tableau-de-bord/sessions" accent="#D42F2D" />
              <div className="sf-card">
                {loading ? (
                  <div className="divide-y" style={{ borderColor: 'rgba(192,48,46,0.04)' }}>
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center gap-3 px-5 py-4">
                        <Skeleton className="h-10 w-10 shrink-0 rounded-xl" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-3.5 w-3/4" />
                          <Skeleton className="h-3 w-1/2" />
                        </div>
                        <Skeleton className="h-5 w-14 rounded-full" />
                      </div>
                    ))}
                  </div>
                ) : sessions.length === 0 ? (
                  <EmptyState icon={<IconEmptyRun />} label="Aucune session planifiée" />
                ) : (
                  <div className="divide-y" style={{ borderColor: 'rgba(192,48,46,0.05)' }}>
                    {sessions.map((s, i) => {
                      const intensity = INTENSITY_CONFIG[s.intensity] ?? { label: s.intensity, bg: 'rgba(192,48,46,0.05)', color: '#D42F2D' }
                      return (
                        <Link
                          key={s.id}
                          href="/tableau-de-bord/sessions"
                          className="sf-event-row sf-slide flex items-center gap-3 px-5 py-3.5"
                          style={{ animationDelay: `${280 + i * 60}ms` }}
                        >
                          <div
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                            style={{ background: 'rgba(192,48,46,0.07)', color: '#D42F2D' }}
                          >
                            <IconRun />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold" style={{ color: '#C0302E' }}>{s.title}</p>
                            <p className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs" style={{ color: 'rgba(192,48,46,0.45)' }}>
                              <span>{SESSION_TYPE_LABEL[s.type] ?? s.type}</span>
                              {s.distance_km && <><span>·</span><span>{s.distance_km} km</span></>}
                              {s.duration_min && <><span>·</span><span>{s.duration_min} min</span></>}
                            </p>
                          </div>
                          <span
                            className="shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold"
                            style={{ background: intensity.bg, color: intensity.color }}
                          >
                            {intensity.label}
                          </span>
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Blog récent ─────────────────────────────────────────────── */}
          <div className="sf-fade" style={{ animationDelay: '320ms' }}>
            <SectionHeader title="Articles récents" href="/tableau-de-bord/blog" accent="#7F7F7F" />

            {loading ? (
              <div className="grid gap-4 sm:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="sf-card p-5 space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                ))}
              </div>
            ) : posts.length === 0 ? (
              <div className="sf-card">
                <EmptyState icon={<IconEmptyPost />} label="Aucun article publié" />
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-3">
                {posts.map((post, i) => (
                  <Link
                    key={post.id}
                    href="/tableau-de-bord/blog"
                    className="sf-blog-card sf-card flex flex-col gap-2 p-5"
                    style={{ animationDelay: `${340 + i * 60}ms` }}
                  >
                    {post.is_pinned && (
                      <span
                        className="inline-flex w-fit items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                        style={{ background: 'rgba(251,57,54,0.1)', color: '#FB3936' }}
                      >
                        <IconPin /> Épinglé
                      </span>
                    )}
                    <p className="line-clamp-2 text-sm font-bold leading-snug" style={{ color: '#C0302E' }}>
                      {post.title}
                    </p>
                    <div className="mt-auto flex items-center gap-1.5 text-xs" style={{ color: 'rgba(192,48,46,0.4)' }}>
                      {post.author && (
                        <span className="font-medium" style={{ color: 'rgba(192,48,46,0.65)' }}>{post.author.name}</span>
                      )}
                      {post.author && <span>·</span>}
                      <span>{formatDate(post.published_at ?? post.created_at)}</span>
                      {post.comments_count > 0 && (
                        <span className="ml-auto font-medium" style={{ color: '#7F7F7F' }}>
                          {post.comments_count} comm.
                        </span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  )
}
