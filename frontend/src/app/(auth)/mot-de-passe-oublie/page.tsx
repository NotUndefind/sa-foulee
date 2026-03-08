import type { Metadata } from 'next'
import ForgotPasswordForm from '@/components/features/auth/ForgotPasswordForm'

export const metadata: Metadata = {
  title: 'Mot de passe oublié',
}

export default function MotDePasseOubliePage() {
  return <ForgotPasswordForm />
}
