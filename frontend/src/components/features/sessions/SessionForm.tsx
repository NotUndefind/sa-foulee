'use client'

import { createSession, updateSession, type SessionPayload } from '@/lib/sessions'
import type { Exercise, Intensity, SessionType, TrainingSession } from '@/types'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'
import ExerciseBuilder from './ExerciseBuilder'

// ---- Schéma de validation ----
const schema = z.object({
  title: z.string().min(3, 'Titre trop court').max(255),
  type: z.enum(['running', 'interval', 'fartlek', 'recovery', 'strength', 'other'] as const),
  distance_km: z.number().positive().nullable().optional(),
  duration_min: z.number().int().positive().nullable().optional(),
  intensity: z.enum(['low', 'medium', 'high'] as const),
  description: z.string().max(10000).optional(),
  is_template: z.boolean(),
  published_at: z.string().nullable().optional(),
})

type FormData = z.infer<typeof schema>

// ---- Options ----
const TYPE_OPTIONS: { value: SessionType; label: string; icon: string }[] = [
  { value: 'running', label: 'Course', icon: '🏃' },
  { value: 'interval', label: 'Interval', icon: '⚡' },
  { value: 'fartlek', label: 'Fartlek', icon: '🌀' },
  { value: 'recovery', label: 'Récupération', icon: '🧘' },
  { value: 'strength', label: 'Renforcement', icon: '💪' },
  { value: 'other', label: 'Autre', icon: '📋' },
]

const INTENSITY_OPTIONS: { value: Intensity; label: string; color: string }[] = [
  { value: 'low', label: 'Faible', color: 'border-green-400 bg-green-50 text-green-700' },
  { value: 'medium', label: 'Moyenne', color: 'border-amber-400 bg-amber-50 text-amber-700' },
  { value: 'high', label: 'Élevée', color: 'border-red-400 bg-red-50 text-red-700' },
]

const STEPS = ['Infos', 'Exercices', 'Options']

interface Props {
  session?: TrainingSession
  templateSource?: TrainingSession // pré-remplit depuis un template
  onSuccess: (session: TrainingSession) => void
  onCancel: () => void
}

export default function SessionForm({ session, templateSource, onSuccess, onCancel }: Props) {
  const isEdit = !!session
  const source = session ?? templateSource
  const [step, setStep] = useState(0)
  const [exercises, setExercises] = useState<Exercise[]>(source?.exercises ?? [])

  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: source?.title ?? '',
      type: source?.type ?? 'running',
      distance_km: source?.distance_km ?? null,
      duration_min: source?.duration_min ?? null,
      intensity: source?.intensity ?? 'medium',
      description: source?.description ?? '',
      is_template: session?.is_template ?? false,
      published_at: session?.published_at
        ? new Date(session.published_at).toISOString().slice(0, 16)
        : new Date().toISOString().slice(0, 16),
    },
  })

  const isTemplate = useWatch({ control, name: 'is_template' })

  const onSubmit = async (data: FormData) => {
    const payload: SessionPayload = {
      title: data.title,
      type: data.type,
      distance_km: data.distance_km ?? null,
      duration_min: data.duration_min ?? null,
      intensity: data.intensity,
      exercises: exercises.filter((e) => e.name.trim() !== ''),
      description: data.description ?? '',
      is_template: data.is_template,
      published_at: data.is_template ? null : data.published_at || new Date().toISOString(),
    }

    try {
      const saved = isEdit
        ? await updateSession(session!.id, payload)
        : await createSession(payload)
      onSuccess(saved)
    } catch (err: unknown) {
      const apiErr = err as { errors?: Record<string, string[]> }
      if (apiErr.errors) {
        Object.entries(apiErr.errors).forEach(([field, msgs]) => {
          setError(field as keyof FormData, { message: msgs[0] })
        })
        setStep(0) // revenir au début si erreur
      }
    }
  }

  const inputCls =
    'w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20'
  const labelCls = 'block text-sm font-medium text-zinc-700 mb-1'
  const errCls = 'mt-1 text-xs text-red-600'

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Stepper */}
      <div className="flex items-center gap-0">
        {STEPS.map((label, idx) => (
          <div key={idx} className="flex flex-1 items-center">
            <button
              type="button"
              onClick={() => setStep(idx)}
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition ${
                step === idx
                  ? 'bg-brand text-white'
                  : idx < step
                    ? 'bg-accent text-white'
                    : 'bg-zinc-200 text-zinc-500'
              }`}
            >
              {idx < step ? '✓' : idx + 1}
            </button>
            <span
              className={`ml-1.5 text-xs font-medium ${step === idx ? 'text-zinc-800' : 'text-zinc-400'}`}
            >
              {label}
            </span>
            {idx < STEPS.length - 1 && (
              <div className={`mx-3 h-0.5 flex-1 ${idx < step ? 'bg-accent' : 'bg-zinc-200'}`} />
            )}
          </div>
        ))}
      </div>

      {/* ---- Étape 1 : Infos de base ---- */}
      {step === 0 && (
        <div className="space-y-4">
          {/* Titre */}
          <div>
            <label className={labelCls}>Titre de la session</label>
            <input {...register('title')} placeholder="Ex: Interval 5×400m" className={inputCls} />
            {errors.title && <p className={errCls}>{errors.title.message}</p>}
          </div>

          {/* Type — grille de boutons */}
          <div>
            <label className={labelCls}>Type de session</label>
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <div className="grid grid-cols-3 gap-2">
                  {TYPE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => field.onChange(opt.value)}
                      className={`flex flex-col items-center gap-1 rounded-xl border-2 py-3 text-sm font-medium transition ${
                        field.value === opt.value
                          ? 'border-brand bg-brand/5 text-brand'
                          : 'border-zinc-200 text-zinc-500 hover:border-zinc-300'
                      }`}
                    >
                      <span className="text-xl">{opt.icon}</span>
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            />
          </div>

          {/* Distance + Durée */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>
                Distance (km) <span className="text-zinc-400">optionnel</span>
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                {...register('distance_km', { valueAsNumber: true })}
                placeholder="Ex: 8.5"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>
                Durée (min) <span className="text-zinc-400">optionnel</span>
              </label>
              <input
                type="number"
                min="1"
                {...register('duration_min', { valueAsNumber: true })}
                placeholder="Ex: 60"
                className={inputCls}
              />
            </div>
          </div>

          {/* Intensité */}
          <div>
            <label className={labelCls}>Intensité</label>
            <Controller
              name="intensity"
              control={control}
              render={({ field }) => (
                <div className="flex gap-2">
                  {INTENSITY_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => field.onChange(opt.value)}
                      className={`flex-1 rounded-lg border-2 py-2 text-sm font-medium transition ${
                        field.value === opt.value
                          ? opt.color
                          : 'border-zinc-200 text-zinc-500 hover:border-zinc-300'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            />
          </div>
        </div>
      )}

      {/* ---- Étape 2 : Exercices ---- */}
      {step === 1 && (
        <div className="space-y-3">
          <p className="text-sm text-zinc-500">
            Ajoutez les exercices structurés de la session. Laissez vide si la session est une
            course libre.
          </p>
          <ExerciseBuilder exercises={exercises} onChange={setExercises} />
        </div>
      )}

      {/* ---- Étape 3 : Options ---- */}
      {step === 2 && (
        <div className="space-y-4">
          {/* Description */}
          <div>
            <label className={labelCls}>Description</label>
            <textarea
              {...register('description')}
              rows={4}
              placeholder="Consignes, objectifs, notes pour les membres…"
              className={inputCls}
            />
          </div>

          {/* Option template */}
          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-zinc-200 p-3 hover:bg-zinc-50">
            <input
              {...register('is_template')}
              type="checkbox"
              className="accent-brand mt-0.5 h-4 w-4 rounded"
            />
            <div>
              <p className="text-sm font-medium text-zinc-800">Sauvegarder comme template</p>
              <p className="text-xs text-zinc-500">
                Réutilisable pour créer de futures sessions rapidement.
              </p>
            </div>
          </label>

          {/* Date de publication (masquée si template) */}
          {!isTemplate && (
            <div>
              <label className={labelCls}>Publier le</label>
              <input {...register('published_at')} type="datetime-local" className={inputCls} />
              <p className="mt-1 text-xs text-zinc-400">
                La session sera visible par les membres à partir de cette date.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Navigation entre étapes */}
      <div className="flex justify-between gap-3 border-t border-zinc-100 pt-2">
        <button
          type="button"
          onClick={step === 0 ? onCancel : () => setStep((s) => s - 1)}
          className="rounded-lg border border-zinc-300 px-4 py-2 text-sm text-zinc-600 hover:bg-zinc-50"
        >
          {step === 0 ? 'Annuler' : '← Précédent'}
        </button>

        {step < STEPS.length - 1 ? (
          <button
            type="button"
            onClick={() => setStep((s) => s + 1)}
            className="bg-brand hover:bg-brand-dark rounded-lg px-4 py-2 text-sm font-medium text-white"
          >
            Suivant →
          </button>
        ) : (
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-brand hover:bg-brand-dark rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {isSubmitting
              ? 'Enregistrement…'
              : isEdit
                ? 'Modifier'
                : isTemplate
                  ? 'Sauvegarder le template'
                  : 'Publier la session'}
          </button>
        )}
      </div>
    </form>
  )
}
