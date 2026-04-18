'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { forgotPassword } from '@/lib/auth'
import { ApiError } from '@/lib/api'

const schema = z.object({
  email: z.email("L'adresse e-mail n'est pas valide.").min(1, "L'adresse e-mail est obligatoire."),
})

type FormValues = z.infer

export default function ForgotPasswordForm() {
  const [success, setSuccess] = useState(false)
  const [globalError, setGlobalError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const onSubmit = async (values: FormValues) => {
    setGlobalError(null)
    try {
      await forgotPassword(values.email)
      setSuccess(true)
    } catch (err) {
      if (err instanceof ApiError) {
        setGlobalError(err.message)
      } else {
        setGlobalError('Une erreur inattendue est survenue. Veuillez réessayer.')
      }
    }
  }

  if (success) {
    return (
      <div className="space-y-4 text-center">
        <div
          className="mx-auto flex h-12 w-12 items-center justify-center rounded-full"
          style={{ background: 'rgba(251,57,54,0.1)' }}
        >
          <svg
            viewBox="0 0 24 24"
            className="h-6 w-6"
            style={{ color: '#FB3936' }}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h1 className="text-xl font-bold" style={{ color: '#C0302E' }}>
          E-mail envoyé !
        </h1>
        <p className="text-sm" style={{ color: '#7F7F7F' }}>
          Si un compte existe pour cette adresse, tu recevras un lien de réinitialisation dans
          quelques minutes.
        </p>
        <Link
          href="/connexion"
          className="inline-block text-sm font-medium transition-colors"
          style={{ color: '#FB3936' }}
        >
          ← Retour à la connexion
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: '#C0302E' }}>
          Mot de passe oublié
        </h1>
        <p className="mt-1 text-sm" style={{ color: '#7F7F7F' }}>
          Saisis ton adresse e-mail pour recevoir un lien de réinitialisation.
        </p>
      </div>

      {globalError && (
        <div
          className="rounded-lg px-4 py-3 text-sm"
          style={{
            background: 'rgba(251,57,54,0.06)',
            border: '1px solid rgba(251,57,54,0.2)',
            color: '#D42F2D',
          }}
        >
          {globalError}
        </div>
      )}

      <div>
        <label
          htmlFor="email"
          className="mb-1 block text-sm font-medium"
          style={{ color: '#2C2C2C' }}
        >
          Adresse e-mail
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          {...register('email')}
          className="auth-input"
          placeholder="marie.dupont@example.fr"
        />
        {errors.email && (
          <p className="mt-1 text-xs" style={{ color: '#FB3936' }}>
            {errors.email.message}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-lg px-4 py-3 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60"
        style={{
          background: 'linear-gradient(135deg, #FB3936 0%, #D42F2D 100%)',
          boxShadow: '0 2px 8px rgba(251,57,54,0.25)',
        }}
      >
        {isSubmitting ? 'Envoi en cours…' : 'Envoyer le lien'}
      </button>

      <p className="text-center text-sm" style={{ color: '#7F7F7F' }}>
        <Link
          href="/connexion"
          className="font-medium transition-colors"
          style={{ color: '#FB3936' }}
        >
          ← Retour à la connexion
        </Link>
      </p>
    </form>
  )
}
