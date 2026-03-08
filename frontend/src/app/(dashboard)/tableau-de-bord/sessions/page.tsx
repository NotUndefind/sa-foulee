import type { Metadata } from 'next'
import SessionsPage from '@/components/features/sessions/SessionsPage'

export const metadata: Metadata = { title: 'Sessions d\'entraînement — saFoulee' }

export default function SessionsRoute() {
  return <SessionsPage />
}
