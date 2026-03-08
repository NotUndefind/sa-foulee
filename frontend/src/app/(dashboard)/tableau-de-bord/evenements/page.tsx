import type { Metadata } from 'next'
import EventsPage from '@/components/features/events/EventsPage'

export const metadata: Metadata = { title: 'Événements — saFoulee' }

export default function EventsRoute() {
  return <EventsPage />
}
