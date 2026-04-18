import type { Metadata } from 'next'
import EventDetailPage from '@/components/features/events/EventDetailPage'

export const metadata: Metadata = { title: 'Événement — La Neuville TAF sa Foulée' }

interface Props {
  params: Promise
}

export default async function EventDetailRoute({ params }: Props) {
  const { id } = await params
  return <EventDetailPage eventId={Number(id)} />
}
