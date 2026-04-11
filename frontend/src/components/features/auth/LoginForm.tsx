'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { login } from '@/lib/auth'
import { useAuthStore } from '@/store/auth.store'
import { ApiError } from '@/lib/api'

const schema = z.object({
  email: z
    .string()
    .min(1, "L'adresse e-mail est obligatoire.")
    .email("L'adresse e-mail n'est pas valide."),
  password: z.string().min(1, 'Le mot de passe est obligatoire.'),
})

type FormValues = z.infer<typeof schema>

function EyeIcon({ open }: { open: boolean }) {
  if (open) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    )
  }
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="2" y1="2" x2="22" y2="22" />
    </svg>
  )
}

export default function LoginForm() {
  const router = useRouter()
  const setUser = useAuthStore((s) => s.setUser)
  const [globalError, setGlobalError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const onSubmit = async (values: FormValues) => {
    setGlobalError(null)
    try {
      const { user, token } = await login(values)
      localStorage.setItem('auth_token', token)
      setUser(user)
      router.push('/tableau-de-bord')
    } catch (err) {
      if (err instanceof ApiError && err.status === 422) {
        setGlobalError("L'adresse e-mail ou le mot de passe est incorrect.")
      } else {
        setGlobalError('Une erreur inattendue est survenue. Veuillez réessayer.')
      }
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: '#C0302E' }}>
          Se connecter
        </h1>
        <p className="mt-1 text-sm" style={{ color: '#7F7F7F' }}>
          Bon retour parmi nous !
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

      <div>
        <div className="mb-1 flex items-center justify-between">
          <label htmlFor="password" className="text-sm font-medium" style={{ color: '#2C2C2C' }}>
            Mot de passe
          </label>
          <Link
            href="/mot-de-passe-oublie"
            className="text-xs transition-colors"
            style={{ color: '#FB3936' }}
          >
            Mot de passe oublié ?
          </Link>
        </div>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            {...register('password')}
            className="auth-input pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            tabIndex={-1}
            aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
            className="password-toggle absolute inset-y-0 right-0 flex w-10 items-center justify-center"
          >
            <EyeIcon open={showPassword} />
          </button>
        </div>
        {errors.password && (
          <p className="mt-1 text-xs" style={{ color: '#FB3936' }}>
            {errors.password.message}
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
        {isSubmitting ? 'Connexion…' : 'Se connecter'}
      </button>

      <p className="text-center text-sm" style={{ color: '#7F7F7F' }}>
        Pas encore membre ?{' '}
        <Link
          href="/inscription"
          className="font-medium transition-colors"
          style={{ color: '#FB3936' }}
        >
          Créer un compte
        </Link>
      </p>
    </form>
  )
}
