import type { Metadata } from 'next'
import SessionsPage from '@/components/features/sessions/SessionsPage'

export const metadata: Metadata = { title: 'Entraînements — La Neuville TAF sa Foulée' }

export default function SessionsRoute() {
  return <SessionsPage />
}
