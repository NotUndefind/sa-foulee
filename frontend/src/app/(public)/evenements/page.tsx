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
  const events = initialData?.data ?? null

  // Rich results Google : schema.org Event pour chaque événement à venir.
  const jsonLd = events?.length
    ? {
        '@context': 'https://schema.org',
        '@graph': events.map((e) => ({
          '@type': 'Event',
          name: e.title,
          startDate: e.event_date,
          ...(e.location ? { location: { '@type': 'Place', name: e.location } } : {}),
          organizer: {
            '@type': 'SportsOrganization',
            name: 'La Neuville TAF sa Foulée',
          },
        })),
      }
    : null

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <PublicEventsPage initialEvents={events} />
    </>
  )
}
