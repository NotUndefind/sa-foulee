import ActivitesPage from '@/components/features/events/ActivitesPage'
import type { PaginatedEvents } from '@/lib/events'
import { serverFetch } from '@/lib/server-api'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Activités',
  description:
    'Découvrez toutes les prochaines activités et sorties de La Neuville TAF sa Foulée. Inscrivez-vous directement en ligne.',
}

// ISR : les activités sont dans le HTML initial (SEO), rafraîchies toutes les 5 min.
export const revalidate = 300

export default async function ActivitesRoute() {
  const [initialUpcoming, initialPast] = await Promise.all([
    serverFetch<PaginatedEvents>('/events?upcoming=1&page=1'),
    serverFetch<PaginatedEvents>('/events?past=1&per_page=6&page=1'),
  ])

  return <ActivitesPage initialUpcoming={initialUpcoming} initialPast={initialPast?.data ?? null} />
}
