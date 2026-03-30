import type { Metadata } from 'next'
import PublicEventsPage from '@/components/features/events/PublicEventsPage'

export const metadata: Metadata = {
  title: 'Événements',
  description: 'Découvrez les prochains événements et sorties de notre association de course.',
}

export default function PublicEventsRoute() {
  return <PublicEventsPage />
}
