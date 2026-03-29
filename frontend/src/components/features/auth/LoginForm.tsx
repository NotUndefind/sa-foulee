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

export default function LoginForm() {
  const router = useRouter()
  const setUser = useAuthStore((s) => s.setUser)
  const [globalError, setGlobalError] = useState<string | null>(null)

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
        <h1 className="text-2xl font-bold" style={{ color: '#7B241C' }}>Se connecter</h1>
        <p className="mt-1 text-sm" style={{ color: '#B0898A' }}>Bon retour parmi nous !</p>
      </div>

      {globalError && (
        <div className="rounded-lg px-4 py-3 text-sm" style={{ background: 'rgba(192,57,43,0.06)', border: '1px solid rgba(192,57,43,0.2)', color: '#922B21' }}>
          {globalError}
        </div>
      )}

      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-medium" style={{ color: '#A93226' }}>
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
        {errors.email && <p className="mt-1 text-xs" style={{ color: '#c0392b' }}>{errors.email.message}</p>}
      </div>

      <div>
        <div className="mb-1 flex items-center justify-between">
          <label htmlFor="password" className="text-sm font-medium" style={{ color: '#A93226' }}>
            Mot de passe
          </label>
          <Link
            href="/mot-de-passe-oublie"
            className="text-xs transition-colors"
            style={{ color: '#C0392B' }}
          >
            Mot de passe oublié ?
          </Link>
        </div>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          {...register('password')}
          className="auth-input"
        />
        {errors.password && (
          <p className="mt-1 text-xs" style={{ color: '#c0392b' }}>{errors.password.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60"
        style={{ background: 'linear-gradient(135deg, #C0392B 0%, #922B21 100%)', boxShadow: '0 2px 8px rgba(192,57,43,0.25)' }}
      >
        {isSubmitting ? 'Connexion…' : 'Se connecter'}
      </button>

      <p className="text-center text-sm" style={{ color: '#B0898A' }}>
        Pas encore membre ?{' '}
        <Link href="/inscription" className="font-medium transition-colors" style={{ color: '#C0392B' }}>
          Créer un compte
        </Link>
      </p>
    </form>
  )
}
