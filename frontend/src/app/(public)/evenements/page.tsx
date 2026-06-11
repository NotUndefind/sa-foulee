import PublicEventsPage from '@/components/features/events/PublicEventsPage'
import type { PaginatedEvents } from '@/lib/events'
import { serverFetch } from '@/lib/server-api'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Événements',
  description: 'Découvrez les prochains événements et sorties de notre association de course.',
}

// ISR : les événements sont dans le HTML initial (SEO), rafraîchis toutes les 5 min.
export const revalidate = 300

export default async function PublicEventsRoute() {
  const initialData = await serverFetch<PaginatedEvents>('/events?upcoming=1&page=1')

  return <PublicEventsPage initialEvents={initialData?.data ?? null} />
}
