import type { Metadata } from 'next'
import AdminSettingsPage from '@/components/features/admin/AdminSettingsPage'

export const metadata: Metadata = { title: 'Paramètres — La Neuville TAF sa Foulée' }

export default function AdminParametresRoute() {
  return <AdminSettingsPage />
}
