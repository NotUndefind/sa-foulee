import type { Metadata } from 'next'
import LoginForm from '@/components/features/auth/LoginForm'

export const metadata: Metadata = {
  title: 'Connexion',
}

export default function ConnexionPage() {
  return <LoginForm />
}
