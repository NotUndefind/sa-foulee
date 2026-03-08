import type { Metadata } from 'next'
import AdminUsersPage from '@/components/features/admin/AdminUsersPage'

export const metadata: Metadata = { title: 'Administration — Membres' }

export default function AdminPage() {
  return <AdminUsersPage />
}
