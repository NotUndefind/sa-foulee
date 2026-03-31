'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { resetPassword } from '@/lib/auth'
import { ApiError } from '@/lib/api'

const schema = z
  .object({
    password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères.'),
    password_confirmation: z.string().min(1, 'Veuillez confirmer votre mot de passe.'),
  })
  .refine((d) => d.password === d.password_confirmation, {
    path: ['password_confirmation'],
    message: 'La confirmation du mot de passe ne correspond pas.',
  })

type FormValues = z.infer<typeof schema>

export default function ResetPasswordForm() {
  const router = useRouter()
  const params = useSearchParams()
  const token = params.get('token') ?? ''
  const email = params.get('email') ?? ''

  const [globalError, setGlobalError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const onSubmit = async (values: FormValues) => {
    setGlobalError(null)
    try {
      await resetPassword({ token, email, ...values })
      router.push('/connexion?reset=success')
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.errors?.token) {
          setError('password', { message: err.errors.token[0] })
        } else {
          setGlobalError(err.message)
        }
      } else {
        setGlobalError('Une erreur inattendue est survenue. Veuillez réessayer.')
      }
    }
  }

  if (!token || !email) {
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
              d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h1 className="text-xl font-bold" style={{ color: '#C0302E' }}>
          Lien invalide
        </h1>
        <p className="text-sm" style={{ color: '#7F7F7F' }}>
          Ce lien de réinitialisation est invalide ou a expiré.
        </p>
        <Link
          href="/mot-de-passe-oublie"
          className="inline-block text-sm font-medium transition-colors"
          style={{ color: '#FB3936' }}
        >
          Demander un nouveau lien
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: '#C0302E' }}>
          Nouveau mot de passe
        </h1>
        <p className="mt-1 text-sm" style={{ color: '#7F7F7F' }}>
          Choisis un mot de passe d&apos;au moins 8 caractères.
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
          htmlFor="password"
          className="mb-1 block text-sm font-medium"
          style={{ color: '#2C2C2C' }}
        >
          Nouveau mot de passe
        </label>
        <input
          id="password"
          type="password"
          autoComplete="new-password"
          {...register('password')}
          className="auth-input"
          placeholder="8 caractères minimum"
        />
        {errors.password && (
          <p className="mt-1 text-xs" style={{ color: '#FB3936' }}>
            {errors.password.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="password_confirmation"
          className="mb-1 block text-sm font-medium"
          style={{ color: '#2C2C2C' }}
        >
          Confirmer le mot de passe
        </label>
        <input
          id="password_confirmation"
          type="password"
          autoComplete="new-password"
          {...register('password_confirmation')}
          className="auth-input"
          placeholder="Répète ton nouveau mot de passe"
        />
        {errors.password_confirmation && (
          <p className="mt-1 text-xs" style={{ color: '#FB3936' }}>
            {errors.password_confirmation.message}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60"
        style={{
          background: 'linear-gradient(135deg, #FB3936 0%, #D42F2D 100%)',
          boxShadow: '0 2px 8px rgba(251,57,54,0.25)',
        }}
      >
        {isSubmitting ? 'Réinitialisation…' : 'Réinitialiser mon mot de passe'}
      </button>
    </form>
  )
}
