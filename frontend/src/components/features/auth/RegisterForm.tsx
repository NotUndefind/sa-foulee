'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { register } from '@/lib/auth'
import { useAuthStore } from '@/store/auth.store'
import { ApiError } from '@/lib/api'
import { passwordSchema } from '@/lib/password-policy'

// ---- Schéma de validation ----

const schema = z
  .object({
    first_name: z.string().min(1, 'Le prénom est obligatoire.').max(50),
    last_name: z.string().min(1, 'Le nom est obligatoire.').max(50),
    email: z.email("L'adresse e-mail n'est pas valide.")
          .min(1, "L'adresse e-mail est obligatoire."),
    password: passwordSchema,
    password_confirmation: z.string().min(1, 'Veuillez confirmer votre mot de passe.'),
    consent: z.boolean().refine((v) => v === true, {
        error: "Vous devez accepter les conditions d'utilisation."
    }),
  })
  .refine((data) => data.password === data.password_confirmation, {
    path: ['password_confirmation'],
      error: 'La confirmation du mot de passe ne correspond pas.'
})

type FormValues = z.infer

// ---- Composant ----

function EyeIcon({ open }: { open: boolean }) {
  if (open) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    )
  }
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="2" y1="2" x2="22" y2="22" />
    </svg>
  )
}

export default function RegisterForm() {
  const router = useRouter()
  const setUser = useAuthStore((s) => s.setUser)
  const [globalError, setGlobalError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false)

  const {
    register: field,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { consent: false },
  })

  const onSubmit = async (values: FormValues) => {
    setGlobalError(null)
    try {
      const { user, token } = await register(values)
      localStorage.setItem('auth_token', token)
      setUser(user)
      router.push('/tableau-de-bord')
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.errors) {
          for (const [field, messages] of Object.entries(err.errors)) {
            setError(field as keyof FormValues, { message: messages[0] })
          }
        } else {
          setGlobalError(err.message)
        }
      } else {
        setGlobalError('Une erreur inattendue est survenue. Veuillez réessayer.')
      }
    }
  }

  const labelStyle = { color: '#2C2C2C' }
  const errorStyle = { color: '#FB3936' }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: '#C0302E' }}>
          Créer un compte
        </h1>
        <p className="mt-1 text-sm" style={{ color: '#7F7F7F' }}>
          Rejoins La Neuville TAF sa Foulée !
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

      {/* Prénom & Nom */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="first_name" className="mb-1 block text-sm font-medium" style={labelStyle}>
            Prénom
          </label>
          <input
            id="first_name"
            type="text"
            autoComplete="given-name"
            {...field('first_name')}
            className="auth-input"
            placeholder="Marie"
          />
          {errors.first_name && (
            <p className="mt-1 text-xs" style={errorStyle}>
              {errors.first_name.message}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="last_name" className="mb-1 block text-sm font-medium" style={labelStyle}>
            Nom
          </label>
          <input
            id="last_name"
            type="text"
            autoComplete="family-name"
            {...field('last_name')}
            className="auth-input"
            placeholder="Dupont"
          />
          {errors.last_name && (
            <p className="mt-1 text-xs" style={errorStyle}>
              {errors.last_name.message}
            </p>
          )}
        </div>
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-medium" style={labelStyle}>
          Adresse e-mail
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          {...field('email')}
          className="auth-input"
          placeholder="marie.dupont@example.fr"
        />
        {errors.email && (
          <p className="mt-1 text-xs" style={errorStyle}>
            {errors.email.message}
          </p>
        )}
      </div>

      {/* Mot de passe */}
      <div>
        <label htmlFor="password" className="mb-1 block text-sm font-medium" style={labelStyle}>
          Mot de passe
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            {...field('password')}
            className="auth-input pr-10"
            placeholder="10 caractères minimum"
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
          <p className="mt-1 text-xs" style={errorStyle}>
            {errors.password.message}
          </p>
        )}
      </div>

      {/* Confirmation mot de passe */}
      <div>
        <label
          htmlFor="password_confirmation"
          className="mb-1 block text-sm font-medium"
          style={labelStyle}
        >
          Confirmer le mot de passe
        </label>
        <div className="relative">
          <input
            id="password_confirmation"
            type={showPasswordConfirmation ? 'text' : 'password'}
            autoComplete="new-password"
            {...field('password_confirmation')}
            className="auth-input pr-10"
            placeholder="Répète ton mot de passe"
          />
          <button
            type="button"
            onClick={() => setShowPasswordConfirmation((v) => !v)}
            tabIndex={-1}
            aria-label={
              showPasswordConfirmation ? 'Masquer le mot de passe' : 'Afficher le mot de passe'
            }
            className="password-toggle absolute inset-y-0 right-0 flex w-10 items-center justify-center"
          >
            <EyeIcon open={showPasswordConfirmation} />
          </button>
        </div>
        {errors.password_confirmation && (
          <p className="mt-1 text-xs" style={errorStyle}>
            {errors.password_confirmation.message}
          </p>
        )}
      </div>

      {/* Consentement RGPD */}
      <div className="flex items-start gap-3">
        <input
          id="consent"
          type="checkbox"
          {...field('consent')}
          className="mt-0.5 h-4 w-4 rounded"
          style={{ accentColor: '#FB3936' }}
        />
        <label htmlFor="consent" className="text-sm" style={{ color: '#2C2C2C' }}>
          J&apos;accepte que mes données personnelles soient traitées par La Neuville TAF sa Foulée
          dans le cadre de ma participation à l&apos;association.{' '}
          <Link
            href="/confidentialite"
            className="underline underline-offset-2"
            style={{ color: '#FB3936' }}
          >
            Politique de confidentialité
          </Link>
        </label>
      </div>
      {errors.consent && (
        <p className="-mt-3 text-xs" style={errorStyle}>
          {errors.consent.message}
        </p>
      )}

      {/* Bouton submit */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-lg px-4 py-3 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60"
        style={{
          background: 'linear-gradient(135deg, #FB3936 0%, #D42F2D 100%)',
          boxShadow: '0 2px 8px rgba(251,57,54,0.25)',
        }}
      >
        {isSubmitting ? 'Inscription en cours…' : 'Créer mon compte'}
      </button>

      {/* Lien vers connexion */}
      <p className="text-center text-sm" style={{ color: '#7F7F7F' }}>
        Déjà membre ?{' '}
        <Link
          href="/connexion"
          className="font-medium transition-colors"
          style={{ color: '#FB3936' }}
        >
          Se connecter
        </Link>
      </p>
    </form>
  )
}
