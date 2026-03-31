import type { Metadata } from 'next'
import EventsPage from '@/components/features/events/EventsPage'

export const metadata: Metadata = { title: 'Événements — La Neuville TAF sa Foulée' }

export default function EventsRoute() {
  return <EventsPage />
}
