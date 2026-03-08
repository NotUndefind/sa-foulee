import type { Metadata } from 'next'
import EventDetailPage from '@/components/features/events/EventDetailPage'

export const metadata: Metadata = { title: 'Événement — saFoulee' }

interface Props {
  params: Promise<{ id: string }>
}

export default async function EventDetailRoute({ params }: Props) {
  const { id } = await params
  return <EventDetailPage eventId={Number(id)} />
}
