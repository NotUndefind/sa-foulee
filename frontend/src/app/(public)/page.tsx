import type { Metadata } from 'next'
import { Baloo_2 } from 'next/font/google'

import ScrollReveal from '@/components/ui/ScrollReveal'
import HeroSection from '@/components/features/public/landing/HeroSection'
import ValuesSection from '@/components/features/public/landing/ValuesSection'
import ActivitiesSection from '@/components/features/public/landing/ActivitiesSection'
import StatsSection from '@/components/features/public/landing/StatsSection'
import EventsSection from '@/components/features/public/landing/EventsSection'
import JoinSection from '@/components/features/public/landing/JoinSection'
import TestimonialsSection from '@/components/features/public/landing/TestimonialsSection'
import AboutSection from '@/components/features/public/landing/AboutSection'
import FinalCTASection from '@/components/features/public/landing/FinalCTASection'
import LandingFooter from '@/components/features/public/landing/LandingFooter'

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
      <HeroSection />
      <ValuesSection />
      <ActivitiesSection />
      <StatsSection stats={homepageStats} />
      <EventsSection events={upcomingEvents} />
      <JoinSection />
      <TestimonialsSection />
      <AboutSection />
      <FinalCTASection />
      <LandingFooter />
      <ScrollReveal />
    </div>
  )
}
