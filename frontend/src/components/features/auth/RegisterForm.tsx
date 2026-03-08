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

// ---- Schéma de validation ----

const schema = z
  .object({
    first_name: z.string().min(1, 'Le prénom est obligatoire.').max(50),
    last_name: z.string().min(1, 'Le nom est obligatoire.').max(50),
    email: z.string().min(1, "L'adresse e-mail est obligatoire.").email("L'adresse e-mail n'est pas valide."),
    password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères.'),
    password_confirmation: z.string().min(1, 'Veuillez confirmer votre mot de passe.'),
    consent: z.boolean().refine((v) => v === true, {
      message: "Vous devez accepter les conditions d'utilisation.",
    }),
  })
  .refine((data) => data.password === data.password_confirmation, {
    path: ['password_confirmation'],
    message: 'La confirmation du mot de passe ne correspond pas.',
  })

type FormValues = z.infer<typeof schema>

// ---- Composant ----

export default function RegisterForm() {
  const router = useRouter()
  const setUser = useAuthStore((s) => s.setUser)
  const [globalError, setGlobalError] = useState<string | null>(null)

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

  const labelStyle = { color: '#3A6B2A' }
  const errorStyle = { color: '#c0392b' }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: '#1E3A14' }}>Créer un compte</h1>
        <p className="mt-1 text-sm" style={{ color: '#7A9E6E' }}>Rejoins sa Foulée !</p>
      </div>

      {globalError && (
        <div className="rounded-lg px-4 py-3 text-sm" style={{ background: 'rgba(208,89,24,0.06)', border: '1px solid rgba(208,89,24,0.2)', color: '#B04A10' }}>
          {globalError}
        </div>
      )}

      {/* Prénom & Nom */}
      <div className="grid grid-cols-2 gap-4">
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
            <p className="mt-1 text-xs" style={errorStyle}>{errors.first_name.message}</p>
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
            <p className="mt-1 text-xs" style={errorStyle}>{errors.last_name.message}</p>
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
        {errors.email && <p className="mt-1 text-xs" style={errorStyle}>{errors.email.message}</p>}
      </div>

      {/* Mot de passe */}
      <div>
        <label htmlFor="password" className="mb-1 block text-sm font-medium" style={labelStyle}>
          Mot de passe
        </label>
        <input
          id="password"
          type="password"
          autoComplete="new-password"
          {...field('password')}
          className="auth-input"
          placeholder="8 caractères minimum"
        />
        {errors.password && (
          <p className="mt-1 text-xs" style={errorStyle}>{errors.password.message}</p>
        )}
      </div>

      {/* Confirmation mot de passe */}
      <div>
        <label htmlFor="password_confirmation" className="mb-1 block text-sm font-medium" style={labelStyle}>
          Confirmer le mot de passe
        </label>
        <input
          id="password_confirmation"
          type="password"
          autoComplete="new-password"
          {...field('password_confirmation')}
          className="auth-input"
          placeholder="Répète ton mot de passe"
        />
        {errors.password_confirmation && (
          <p className="mt-1 text-xs" style={errorStyle}>{errors.password_confirmation.message}</p>
        )}
      </div>

      {/* Consentement RGPD */}
      <div className="flex items-start gap-3">
        <input
          id="consent"
          type="checkbox"
          {...field('consent')}
          className="mt-0.5 h-4 w-4 rounded"
          style={{ accentColor: '#D05918' }}
        />
        <label htmlFor="consent" className="text-sm" style={{ color: '#3A6B2A' }}>
          J&apos;accepte que mes données personnelles soient traitées par sa Foulée dans le cadre de
          ma participation à l&apos;association.{' '}
          <Link href="/confidentialite" className="underline underline-offset-2" style={{ color: '#D05918' }}>
            Politique de confidentialité
          </Link>
        </label>
      </div>
      {errors.consent && <p className="-mt-3 text-xs" style={errorStyle}>{errors.consent.message}</p>}

      {/* Bouton submit */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60"
        style={{ background: 'linear-gradient(135deg, #D05918 0%, #B04A10 100%)', boxShadow: '0 2px 8px rgba(208,89,24,0.25)' }}
      >
        {isSubmitting ? 'Inscription en cours…' : 'Créer mon compte'}
      </button>

      {/* Lien vers connexion */}
      <p className="text-center text-sm" style={{ color: '#7A9E6E' }}>
        Déjà membre ?{' '}
        <Link href="/connexion" className="font-medium transition-colors" style={{ color: '#D05918' }}>
          Se connecter
        </Link>
      </p>
    </form>
  )
}
