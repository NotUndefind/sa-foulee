import type { Metadata } from 'next'
import { Suspense } from 'react'
import ResetPasswordForm from '@/components/features/auth/ResetPasswordForm'

export const metadata: Metadata = {
  title: 'Réinitialiser le mot de passe',
}

export default function ReinitialiserMotDePassePage() {
  return (
    // Suspense requis car ResetPasswordForm utilise useSearchParams
    <Suspense fallback={<div className="text-center text-sm text-zinc-400">Chargement…</div>}>
      <ResetPasswordForm />
    </Suspense>
  )
}
