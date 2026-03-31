'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import type { Event, EventPhoto, EventType } from '@/types'
import { getEvents, registerToEvent, getEventPhotos } from '@/lib/events'
import { useAuthStore } from '@/store/auth.store'

// ── Labels & styles ────────────────────────────────────────────────────────

const TYPE_LABELS: Record<EventType | 'all', string> = {
  all:         'Tous',
  race:        'Course',
  outing:      'Sortie',
  competition: 'Compétition',
  other:       'Autre',
}

const TYPE_BADGE: Record<EventType, { bg: string; color: string }> = {
  race:        { bg: 'rgba(251,57,54,0.12)', color: '#D42F2D' },
  outing:      { bg: 'rgba(192,48,46,0.08)',  color: '#C0302E' },
  competition: { bg: 'rgba(176,137,138,0.2)', color: '#D42F2D' },
  other:       { bg: 'rgba(26,26,26,0.06)',   color: '#555' },
}

// Gradient backgrounds for past event cards (no cover photo)
const PAST_CARD_GRADIENTS: Record<EventType, string> = {
  race:        'linear-gradient(135deg, #FB3936 0%, #D42F2D 100%)',
  outing:      'linear-gradient(135deg, #C0302E 0%, #D42F2D 100%)',
  competition: 'linear-gradient(135deg, #7F7F7F 0%, #D42F2D 100%)',
  other:       'linear-gradient(135deg, #2C2C2C 0%, #1A1A1A 100%)',
}

const MONTHS_FR = ['jan', 'fév', 'mar', 'avr', 'mai', 'jun', 'jul', 'aoû', 'sep', 'oct', 'nov', 'déc']

// ── SVG Icons ─────────────────────────────────────────────────────────────

function IconMapPin() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}

function IconUsers() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}

function IconEmptyState() {
  return (
    <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 6.1H3" /><path d="M21 12.1H3" /><path d="M15.1 18H3" />
    </svg>
  )
}

function IconCamera() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  )
}

function IconClose() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

function IconChevronLeft() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  )
}

function IconChevronRight() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  )
}

// ── Gallery Modal ─────────────────────────────────────────────────────────

interface GalleryModalProps {
  event: Event
  photos: EventPhoto[]
  loading: boolean
  onClose: () => void
}

function GalleryModal({ event, photos, loading, onClose }: GalleryModalProps) {
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null)
  const overlayRef = useRef<HTMLDivElement>(null)

  // Close on ESC
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (lightboxIdx !== null) setLightboxIdx(null)
        else onClose()
      }
      if (e.key === 'ArrowLeft' && lightboxIdx !== null)
        setLightboxIdx(i => i !== null && i > 0 ? i - 1 : i)
      if (e.key === 'ArrowRight' && lightboxIdx !== null)
        setLightboxIdx(i => i !== null && i < photos.length - 1 ? i + 1 : i)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightboxIdx, photos.length, onClose])

  const date = new Date(event.event_date)
  const dateStr = date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <>
      {/* Modal overlay */}
      <div
        ref={overlayRef}
        onClick={(e) => { if (e.target === overlayRef.current) onClose() }}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 200,
          background: 'rgba(26,26,26,0.7)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
        }}
      >
        <div style={{
          background: '#FFFFFF',
          borderRadius: '20px',
          width: '100%',
          maxWidth: '800px',
          maxHeight: '90vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 24px 80px rgba(26,26,26,0.4)',
        }}>
          {/* Modal header */}
          <div style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid rgba(192,48,46,0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
          }}>
            <div>
              <p style={{ fontSize: '0.75rem', color: '#7F7F7F', fontWeight: 600, margin: 0 }}>
                {dateStr}
              </p>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#C0302E', margin: '0.125rem 0 0' }}>
                {event.title}
              </h3>
            </div>
            <button
              onClick={onClose}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                border: '1.5px solid rgba(192,48,46,0.15)',
                background: 'transparent',
                color: '#C0302E',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <IconClose />
            </button>
          </div>

          {/* Photos content */}
          <div style={{ overflowY: 'auto', padding: '1.5rem', flex: 1 }}>
            {loading ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} style={{
                    aspectRatio: '1',
                    borderRadius: '12px',
                    background: 'rgba(192,48,46,0.06)',
                    animation: 'pulse 1.6s ease-in-out infinite',
                  }} />
                ))}
              </div>
            ) : photos.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                <div style={{ color: 'rgba(192,48,46,0.2)', marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>
                  <IconCamera />
                </div>
                <p style={{ fontWeight: 600, color: '#C0302E', margin: '0 0 0.5rem' }}>
                  Aucune photo pour l&apos;instant
                </p>
                <p style={{ fontSize: '0.875rem', color: '#2C2C2C', opacity: 0.7, margin: 0 }}>
                  Les créateurs et organisateurs peuvent ajouter des photos depuis leur espace.
                </p>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '0.75rem',
              }}>
                <style>{`
                  @media (max-width: 600px) {
                    .photo-grid { grid-template-columns: repeat(2, 1fr) !important; }
                  }
                  @media (max-width: 360px) {
                    .photo-grid { grid-template-columns: 1fr !important; }
                  }
                  .photo-thumb:hover { opacity: 0.85; transform: scale(1.02); }
                `}</style>
                {photos.map((photo, idx) => (
                  <button
                    key={photo.id}
                    className="photo-thumb"
                    onClick={() => setLightboxIdx(idx)}
                    style={{
                      aspectRatio: '1',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      border: 'none',
                      padding: 0,
                      cursor: 'pointer',
                      position: 'relative',
                      transition: 'opacity 0.15s ease, transform 0.15s ease',
                    }}
                  >
                    <Image
                      src={photo.url}
                      alt={`Photo ${idx + 1}`}
                      fill
                      style={{ objectFit: 'cover' }}
                      sizes="(max-width: 600px) 50vw, 200px"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lightbox viewer */}
      {lightboxIdx !== null && photos[lightboxIdx] && (
        <div
          onClick={() => setLightboxIdx(null)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 300,
            background: 'rgba(0,0,0,0.92)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <button
            onClick={(e) => { e.stopPropagation(); setLightboxIdx(i => i !== null && i > 0 ? i - 1 : i) }}
            disabled={lightboxIdx === 0}
            style={{
              position: 'absolute',
              left: '1rem',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: '#fff',
              cursor: lightboxIdx === 0 ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: lightboxIdx === 0 ? 0.3 : 1,
            }}
          >
            <IconChevronLeft />
          </button>

          <div
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '90vw', maxHeight: '90vh', position: 'relative' }}
          >
            <Image
              src={photos[lightboxIdx].url}
              alt={`Photo ${lightboxIdx + 1}`}
              width={1200}
              height={800}
              style={{ objectFit: 'contain', maxWidth: '90vw', maxHeight: '85vh', borderRadius: '8px' }}
            />
            <p style={{
              position: 'absolute',
              bottom: '-2rem',
              left: '50%',
              transform: 'translateX(-50%)',
              color: 'rgba(255,255,255,0.5)',
              fontSize: '0.8125rem',
              whiteSpace: 'nowrap',
            }}>
              {lightboxIdx + 1} / {photos.length}
            </p>
          </div>

          <button
            onClick={(e) => { e.stopPropagation(); setLightboxIdx(i => i !== null && i < photos.length - 1 ? i + 1 : i) }}
            disabled={lightboxIdx === photos.length - 1}
            style={{
              position: 'absolute',
              right: '1rem',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: '#fff',
              cursor: lightboxIdx === photos.length - 1 ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: lightboxIdx === photos.length - 1 ? 0.3 : 1,
            }}
          >
            <IconChevronRight />
          </button>

          <button
            onClick={() => setLightboxIdx(null)}
            style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: '#fff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <IconClose />
          </button>
        </div>
      )}
    </>
  )
}

// ── Main Component ─────────────────────────────────────────────────────────

export default function ActivitesPage() {
  const { user } = useAuthStore()

  // Upcoming events state
  const [events, setEvents]           = useState<Event[]>([])
  const [loading, setLoading]         = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [lastPage, setLastPage]       = useState(1)
  const [activeFilter, setActiveFilter] = useState<EventType | ''>('')
  const [registeringId, setRegisteringId] = useState<number | null>(null)

  // Past events state
  const [pastEvents, setPastEvents]       = useState<Event[]>([])
  const [pastLoading, setPastLoading]     = useState(true)

  // Gallery state
  const [galleryEvent, setGalleryEvent]   = useState<Event | null>(null)
  const [galleryPhotos, setGalleryPhotos] = useState<EventPhoto[]>([])
  const [galleryLoading, setGalleryLoading] = useState(false)

  const fetchEvents = useCallback(async (page: number, type: EventType | '') => {
    setLoading(true)
    try {
      const res = await getEvents({ upcoming: true, page, type: type || undefined })
      setEvents(res.data)
      setLastPage(res.meta.last_page)
    } catch {
      setEvents([])
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchPastEvents = useCallback(async () => {
    setPastLoading(true)
    try {
      const res = await getEvents({ past: true, per_page: 6, page: 1 })
      setPastEvents(res.data)
    } catch {
      setPastEvents([])
    } finally {
      setPastLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchEvents(currentPage, activeFilter)
  }, [fetchEvents, currentPage, activeFilter])

  useEffect(() => {
    fetchPastEvents()
  }, [fetchPastEvents])

  const handleFilterChange = (type: EventType | '') => {
    setActiveFilter(type)
    setCurrentPage(1)
  }

  const handleRegister = async (eventId: number) => {
    if (!user) return
    setRegisteringId(eventId)
    try {
      await registerToEvent(eventId)
      setEvents(prev =>
        prev.map(e =>
          e.id === eventId
            ? { ...e, is_registered: true, registrations_count: e.registrations_count + 1 }
            : e
        )
      )
    } catch {
      // silently fail
    } finally {
      setRegisteringId(null)
    }
  }

  const openGallery = async (event: Event) => {
    setGalleryEvent(event)
    setGalleryPhotos([])
    setGalleryLoading(true)
    try {
      const photos = await getEventPhotos(event.id)
      setGalleryPhotos(photos)
    } catch {
      setGalleryPhotos([])
    } finally {
      setGalleryLoading(false)
    }
  }

  return (
    <>
      {galleryEvent && (
        <GalleryModal
          event={galleryEvent}
          photos={galleryPhotos}
          loading={galleryLoading}
          onClose={() => setGalleryEvent(null)}
        />
      )}

      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '3rem 1.5rem 5rem' }}>

        {/* ── Page header ────────────────────────────────────────── */}
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div style={{
              width: '4px',
              height: '32px',
              borderRadius: '2px',
              background: 'linear-gradient(to bottom, #FB3936, #C0302E)',
              flexShrink: 0,
            }} />
            <h1 style={{
              fontSize: '2rem',
              fontWeight: 800,
              color: '#C0302E',
              margin: 0,
              letterSpacing: '-0.02em',
            }}>
              Nos activités
            </h1>
          </div>
          <p style={{ fontSize: '1rem', color: '#2C2C2C', opacity: 0.8, margin: 0, paddingLeft: '1.25rem' }}>
            Rejoignez les prochaines sorties et événements de La Neuville TAF sa Foulée.
          </p>
        </div>

        {/* ── Type filters ──────────────────────────────────────── */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
          {(['', 'race', 'outing', 'competition', 'other'] as (EventType | '')[]).map((type) => {
            const isActive = activeFilter === type
            return (
              <button
                key={type || 'all'}
                onClick={() => handleFilterChange(type as EventType | '')}
                style={{
                  padding: '0.375rem 1rem',
                  borderRadius: '999px',
                  border: `1.5px solid ${isActive ? '#FB3936' : 'rgba(192,48,46,0.15)'}`,
                  background: isActive ? '#FB3936' : 'transparent',
                  color: isActive ? '#fff' : '#D42F2D',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {TYPE_LABELS[(type || 'all') as EventType | 'all']}
              </button>
            )
          })}
        </div>

        {/* ── Upcoming events ───────────────────────────────────── */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{
                height: '100px',
                borderRadius: '16px',
                background: 'rgba(192,48,46,0.05)',
                animation: 'pulse 1.6s ease-in-out infinite',
              }} />
            ))}
          </div>
        ) : events.length === 0 ? (
          <div style={{
            borderRadius: '20px',
            background: 'rgba(255,255,255,0.8)',
            border: '1px solid rgba(192,48,46,0.08)',
            padding: '4rem 2rem',
            textAlign: 'center',
          }}>
            <div style={{ color: 'rgba(192,48,46,0.25)', marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>
              <IconEmptyState />
            </div>
            <p style={{ fontWeight: 700, color: '#C0302E', margin: '0 0 0.5rem' }}>
              Aucune activité à venir
            </p>
            <p style={{ fontSize: '0.875rem', color: '#2C2C2C', opacity: 0.7, margin: 0 }}>
              Revenez bientôt — de nouvelles sorties sont en préparation !
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {events.map((event) => {
              const date        = new Date(event.event_date)
              const badge       = TYPE_BADGE[event.type]
              const isRegistering = registeringId === event.id

              return (
                <div key={event.id} style={{
                  display: 'flex',
                  gap: '1.25rem',
                  alignItems: 'center',
                  borderRadius: '16px',
                  background: '#fff',
                  border: '1px solid rgba(192,48,46,0.07)',
                  boxShadow: '0 2px 8px rgba(192,48,46,0.06)',
                  padding: '1.25rem 1.5rem',
                }}>

                  {/* Date badge */}
                  <div style={{
                    flexShrink: 0,
                    width: '56px',
                    height: '64px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #FB3936 0%, #D42F2D 100%)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                  }}>
                    <span style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.9 }}>
                      {MONTHS_FR[date.getMonth()]}
                    </span>
                    <span style={{ fontSize: '1.5rem', fontWeight: 800, lineHeight: 1 }}>
                      {date.getDate()}
                    </span>
                  </div>

                  {/* Event info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ marginBottom: '0.375rem' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '0.175rem 0.625rem',
                        borderRadius: '999px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        background: badge.bg,
                        color: badge.color,
                      }}>
                        {TYPE_LABELS[event.type]}
                      </span>
                    </div>
                    <p style={{ fontWeight: 700, color: '#C0302E', margin: '0 0 0.375rem', fontSize: '1rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {event.title}
                    </p>
                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8125rem', color: '#2C2C2C', opacity: 0.75, flexWrap: 'wrap' }}>
                      {event.location && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <IconMapPin /> {event.location}
                        </span>
                      )}
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <IconUsers /> {event.registrations_count} inscrit{event.registrations_count !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>

                  {/* Join button — auth-aware */}
                  <div style={{ flexShrink: 0 }}>
                    {!user ? (
                      <Link
                        href="/connexion"
                        style={{
                          display: 'inline-block',
                          padding: '0.5rem 1.25rem',
                          borderRadius: '10px',
                          background: '#C0302E',
                          color: '#fff',
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          textDecoration: 'none',
                        }}
                      >
                        Rejoindre
                      </Link>
                    ) : event.is_registered ? (
                      <span style={{
                        display: 'inline-block',
                        padding: '0.5rem 1.25rem',
                        borderRadius: '10px',
                        background: 'rgba(192,48,46,0.08)',
                        color: '#D42F2D',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                      }}>
                        Inscrit
                      </span>
                    ) : (
                      <button
                        onClick={() => handleRegister(event.id)}
                        disabled={isRegistering}
                        style={{
                          padding: '0.5rem 1.25rem',
                          borderRadius: '10px',
                          background: isRegistering ? 'rgba(251,57,54,0.55)' : '#FB3936',
                          color: '#fff',
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          border: 'none',
                          cursor: isRegistering ? 'not-allowed' : 'pointer',
                          boxShadow: '0 2px 8px rgba(251,57,54,0.25)',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        {isRegistering ? 'En cours…' : 'Rejoindre'}
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* ── Pagination ────────────────────────────────────────── */}
        {!loading && lastPage > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.75rem', marginTop: '2.5rem' }}>
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              style={{
                padding: '0.5rem 1.25rem',
                borderRadius: '10px',
                border: '1.5px solid rgba(192,48,46,0.15)',
                background: currentPage === 1 ? 'transparent' : '#fff',
                color: currentPage === 1 ? 'rgba(192,48,46,0.3)' : '#C0302E',
                fontWeight: 600,
                fontSize: '0.875rem',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              }}
            >
              Précédent
            </button>
            <span style={{ fontSize: '0.875rem', color: '#2C2C2C' }}>
              Page {currentPage} / {lastPage}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(lastPage, p + 1))}
              disabled={currentPage === lastPage}
              style={{
                padding: '0.5rem 1.25rem',
                borderRadius: '10px',
                border: '1.5px solid rgba(192,48,46,0.15)',
                background: currentPage === lastPage ? 'transparent' : '#fff',
                color: currentPage === lastPage ? 'rgba(192,48,46,0.3)' : '#C0302E',
                fontWeight: 600,
                fontSize: '0.875rem',
                cursor: currentPage === lastPage ? 'not-allowed' : 'pointer',
              }}
            >
              Suivant
            </button>
          </div>
        )}

        {/* ── Bottom note for visitors ──────────────────────────── */}
        {!user && !loading && events.length > 0 && (
          <p style={{ textAlign: 'center', fontSize: '0.875rem', color: '#2C2C2C', opacity: 0.7, marginTop: '2.5rem' }}>
            <Link href="/connexion" style={{ color: '#FB3936', fontWeight: 600, textDecoration: 'none' }}>
              Connectez-vous
            </Link>{' '}
            pour vous inscrire aux activités.
          </p>
        )}

        {/* ── Past events — "Nos dernières sorties" ─────────────── */}
        {!pastLoading && pastEvents.length > 0 && (
          <div style={{ marginTop: '4rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.75rem' }}>
              <div style={{
                width: '4px',
                height: '28px',
                borderRadius: '2px',
                background: 'linear-gradient(to bottom, #7F7F7F, #C0302E)',
                flexShrink: 0,
              }} />
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#C0302E', margin: 0, letterSpacing: '-0.01em' }}>
                Nos dernières sorties
              </h2>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '1rem',
            }}>
              <style>{`
                @media (max-width: 700px) { .past-grid { grid-template-columns: repeat(2, 1fr) !important; } }
                @media (max-width: 480px) { .past-grid { grid-template-columns: 1fr !important; } }
                .past-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(192,48,46,0.14) !important; }
                .past-card:hover .past-card-overlay { opacity: 0.55 !important; }
              `}</style>
              {pastEvents.map((event) => {
                const date = new Date(event.event_date)
                const dateStr = date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
                const gradient = PAST_CARD_GRADIENTS[event.type]

                return (
                  <button
                    key={event.id}
                    className="past-card"
                    onClick={() => openGallery(event)}
                    style={{
                      borderRadius: '16px',
                      overflow: 'hidden',
                      border: 'none',
                      padding: 0,
                      cursor: 'pointer',
                      position: 'relative',
                      height: '180px',
                      background: gradient,
                      boxShadow: '0 4px 16px rgba(192,48,46,0.12)',
                      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                      textAlign: 'left',
                    }}
                  >
                    {/* Gradient overlay */}
                    <div
                      className="past-card-overlay"
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.15) 50%, transparent 100%)',
                        opacity: 0.4,
                        transition: 'opacity 0.2s ease',
                      }}
                    />

                    {/* Type badge */}
                    <div style={{ position: 'absolute', top: '0.875rem', left: '0.875rem' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '0.2rem 0.625rem',
                        borderRadius: '999px',
                        fontSize: '0.6875rem',
                        fontWeight: 700,
                        background: 'rgba(255,255,255,0.2)',
                        backdropFilter: 'blur(8px)',
                        color: '#fff',
                      }}>
                        {TYPE_LABELS[event.type]}
                      </span>
                    </div>

                    {/* Camera icon */}
                    <div style={{ position: 'absolute', top: '0.875rem', right: '0.875rem', color: 'rgba(255,255,255,0.6)' }}>
                      <IconCamera />
                    </div>

                    {/* Card footer */}
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '0.875rem' }}>
                      <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.75)', margin: '0 0 0.25rem', fontWeight: 500 }}>
                        {dateStr}
                      </p>
                      <p style={{ fontSize: '0.9375rem', fontWeight: 800, color: '#fff', margin: '0 0 0.25rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {event.title}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem' }}>
                        <IconUsers />
                        <span>{event.registrations_count} participant{event.registrations_count !== 1 ? 's' : ''}</span>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}

      </div>
    </>
  )
}
