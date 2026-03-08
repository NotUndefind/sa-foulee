import type { Metadata } from 'next'
import ProfilePage from '@/components/features/profile/ProfilePage'

export const metadata: Metadata = { title: 'Mon profil' }

export default function ProfilPage() {
  return <ProfilePage />
}
