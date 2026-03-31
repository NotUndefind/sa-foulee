import type { Metadata } from 'next'
import ActivitesPage from '@/components/features/events/ActivitesPage'

export const metadata: Metadata = {
  title: 'Activités',
  description:
    'Découvrez toutes les prochaines activités et sorties de La Neuville TAF sa Foulée. Inscrivez-vous directement en ligne.',
}

export default function ActivitesRoute() {
  return <ActivitesPage />
}
