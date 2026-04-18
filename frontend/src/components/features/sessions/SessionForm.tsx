'use client'

import {
  createLocation,
  createSession,
  getLocations,
  updateSession,
  type SessionPayload,
} from '@/lib/sessions'
import type { Exercise, Intensity, Location, SessionType, TrainingSession } from '@/types'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import type { ComponentType } from 'react'
import { Controller, useForm, useWatch, type FieldErrors, type Resolver } from 'react-hook-form'
import { z } from 'zod'
import { Timer, Zap, Wind, HeartPulse, Dumbbell, ClipboardList, Check } from 'lucide-react'
import ExerciseBuilder from './ExerciseBuilder'

// ---- Schéma de validation ----
const nanToNull = (v: unknown) => (v === '' || (typeof v === 'number' && isNaN(v)) ? null : v)

const schema = z
  .object({
    title: z.string().min(3, 'Titre trop court').max(255),
    type: z.enum(['running', 'interval', 'fartlek', 'recovery', 'strength', 'other'] as const),
    distance_km: z.preprocess(nanToNull, z.number().positive().nullable().optional()),
    duration_min: z.preprocess(nanToNull, z.int().positive().nullable().optional()),
    intensity: z.enum(['low', 'medium', 'high'] as const),
    description: z.string().max(10000).optional(),
    is_template: z.boolean(),
    session_date: z.string().nullable().optional(),
    location_id: z.preprocess(nanToNull, z.int().positive().nullable().optional()),
  })
  .superRefine((data, ctx) => {
    if (!data.is_template && !data.session_date) {
      ctx.addIssue({
        code: 'custom',
        message: 'La date de séance est obligatoire.',
        path: ['session_date'],
      })
    }
  })

type FormData = z.infer

// ---- Options ----
const TYPE_OPTIONS: { value: SessionType; label: string; icon: ComponentType }[] = [
  { value: 'running', label: 'Course', icon: Timer },
  { value: 'interval', label: 'Interval', icon: Zap },
  { value: 'fartlek', label: 'Fartlek', icon: Wind },
  { value: 'recovery', label: 'Récupération', icon: HeartPulse },
  { value: 'strength', label: 'Renforcement', icon: Dumbbell },
  { value: 'other', label: 'Autre', icon: ClipboardList },
]

const INTENSITY_OPTIONS: { value: Intensity; label: string; color: string }[] = [
  { value: 'low', label: 'Faible', color: 'border-green-400 bg-green-50 text-green-700' },
  { value: 'medium', label: 'Moyenne', color: 'border-amber-400 bg-amber-50 text-amber-700' },
  { value: 'high', label: 'Élevée', color: 'border-red-400 bg-red-50 text-red-700' },
]

const STEPS = ['Infos', 'Exercices', 'Options']

interface Props {
  session?: TrainingSession
  templateSource?: TrainingSession
  onSuccess: (session: TrainingSession) => void
  onCancel: () => void
}

export default function SessionForm({ session, templateSource, onSuccess, onCancel }: Props) {
  const isEdit = !!session
  const source = session ?? templateSource
  const [step, setStep] = useState(0)
  const [exercises, setExercises] = useState<Exercise[]>(
    (source?.exercises ?? []).map((ex) => ({ ...ex, _key: crypto.randomUUID() }))
  )
  const [submitError, setSubmitError] = useState<string | null>(null)

  const [locations, setLocations] = useState<Location[]>([])
  const [newLocationName, setNewLocationName] = useState('')
  const [showNewLocation, setShowNewLocation] = useState(false)
  const [locationLoading, setLocationLoading] = useState(false)

  useEffect(() => {
    getLocations()
      .then((res) => setLocations(res.data))
      .catch(() => setSubmitError('Impossible de charger les lieux. Veuillez recharger la page.'))
  }, [])

  const {
    register,
    control,
    handleSubmit,
    setError,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema) as Resolver,
    defaultValues: {
      title: source?.title ?? '',
      type: source?.type ?? 'running',
      distance_km: source?.distance_km ?? null,
      duration_min: source?.duration_min ?? null,
      intensity: source?.intensity ?? 'medium',
      description: source?.description ?? '',
      is_template: session?.is_template ?? false,
      session_date: session?.session_date
        ? new Date(session.session_date).toISOString().slice(0, 16)
        : '',
      location_id: session?.location?.id ?? null,
    },
  })

  const isTemplate = useWatch({ control, name: 'is_template' })

  const handleCreateLocation = async () => {
    const name = newLocationName.trim()
    if (!name) return
    setLocationLoading(true)
    try {
      const created = await createLocation(name)
      setLocations((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)))
      setValue('location_id', created.id)
      setNewLocationName('')
      setShowNewLocation(false)
    } catch {
      setSubmitError('Impossible de créer le lieu. Vérifiez votre connexion.')
    } finally {
      setLocationLoading(false)
    }
  }

  const onFormError = (validationErrors: FieldErrors) => {
    const step0Fields = new Set(['title', 'type', 'distance_km', 'duration_min', 'intensity'])
    const keys = Object.keys(validationErrors)
    if (keys.some((k) => step0Fields.has(k))) {
      setStep(0)
    } else {
      setStep(2)
    }
    const firstMsg = Object.values(validationErrors)[0]?.message
    setSubmitError(firstMsg ?? 'Certains champs obligatoires ne sont pas remplis.')
  }

  const onSubmit = async (data: FormData) => {
    setSubmitError(null)
    const payload: SessionPayload = {
      title: data.title,
      type: data.type,
      distance_km: data.distance_km ?? null,
      duration_min: data.duration_min ?? null,
      intensity: data.intensity,
      exercises: exercises.filter((e) => e.name.trim() !== '').map(({ _key, ...rest }) => rest),
      description: data.description ?? '',
      is_template: data.is_template,
      location_id: data.is_template ? null : data.location_id ?? null,
      session_date: data.is_template ? null : data.session_date || null,
    }

    try {
      const saved = isEdit
        ? await updateSession(session!.id, payload)
        : await createSession(payload)
      onSuccess(saved)
    } catch (err: unknown) {
      const apiErr = err as { errors?: Record; message?: string }
      if (apiErr.errors) {
        const step2Fields = new Set(['session_date', 'location_id', 'description', 'is_template'])
        let targetStep = 0
        Object.entries(apiErr.errors).forEach(([field, msgs]) => {
          setError(field as keyof FormData, { message: msgs[0] })
          if (step2Fields.has(field)) targetStep = 2
        })
        setStep(targetStep)
      } else {
        setSubmitError(apiErr.message ?? 'Une erreur est survenue. Veuillez réessayer.')
      }
    }
  }

  const inputCls =
    'w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20'
  const labelCls = 'block text-sm font-medium text-zinc-700 mb-1'
  const errCls = 'mt-1 text-xs text-red-600'

  return (
    <form onSubmit={handleSubmit(onSubmit, onFormError)} className="space-y-6">
      {submitError && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
          {submitError}
        </p>
      )}

      {/* Stepper */}
      <div className="flex items-center gap-0">
        {STEPS.map((label, idx) => (
          <div key={idx} className="flex flex-1 items-center">
            <button
              type="button"
              onClick={() => setStep(idx)}
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition ${
                step === idx
                  ? 'bg-primary text-white'
                  : idx < step
                    ? 'bg-accent text-white'
                    : 'bg-zinc-200 text-zinc-500'
              }`}
            >
              {idx < step ? <Check size={12} /> : idx + 1}
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
          <div>
            <label htmlFor="field-title" className={labelCls}>
              Titre de la session
            </label>
            <input
              id="field-title"
              {...register('title')}
              placeholder="Ex: Interval 5×400m"
              className={inputCls}
            />
            {errors.title && <p className={errCls}>{errors.title.message}</p>}
          </div>

          <div>
            <label className={labelCls}>Type de session</label>
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <div className="grid grid-cols-3 gap-2">
                  {TYPE_OPTIONS.map((opt) => {
                    const OptIcon = opt.icon
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => field.onChange(opt.value)}
                        className={`flex flex-col items-center gap-1 rounded-xl border-2 py-3 text-sm font-medium transition ${
                          field.value === opt.value
                            ? 'border-primary bg-primary/5 text-primary'
                            : 'border-zinc-200 text-zinc-500 hover:border-zinc-300'
                        }`}
                      >
                        <OptIcon size={20} />
                        {opt.label}
                      </button>
                    )
                  })}
                </div>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="field-distance" className={labelCls}>
                Distance (km) <span className="text-zinc-400">optionnel</span>
              </label>
              <input
                id="field-distance"
                type="number"
                step="0.1"
                min="0"
                {...register('distance_km', { valueAsNumber: true })}
                placeholder="Ex: 8.5"
                className={inputCls}
              />
            </div>
            <div>
              <label htmlFor="field-duration" className={labelCls}>
                Durée (min) <span className="text-zinc-400">optionnel</span>
              </label>
              <input
                id="field-duration"
                type="number"
                min="1"
                {...register('duration_min', { valueAsNumber: true })}
                placeholder="Ex: 60"
                className={inputCls}
              />
            </div>
          </div>

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
          <div>
            <label htmlFor="field-description" className={labelCls}>
              Description
            </label>
            <textarea
              id="field-description"
              {...register('description')}
              rows={4}
              placeholder="Consignes, objectifs, notes pour les membres…"
              className={inputCls}
            />
          </div>

          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-zinc-200 p-3 hover:bg-zinc-50">
            <input
              {...register('is_template')}
              type="checkbox"
              className="accent-primary mt-0.5 h-4 w-4 rounded"
            />
            <div>
              <p className="text-sm font-medium text-zinc-800">Sauvegarder comme template</p>
              <p className="text-xs text-zinc-500">
                Réutilisable pour créer de futures sessions rapidement.
              </p>
            </div>
          </label>

          {!isTemplate && (
            <>
              <div>
                <label htmlFor="field-session-date" className={labelCls}>
                  Date de la séance <span className="text-red-500">*</span>
                </label>
                <input
                  id="field-session-date"
                  {...register('session_date')}
                  type="datetime-local"
                  className={inputCls}
                />
                {errors.session_date && <p className={errCls}>{errors.session_date.message}</p>}
              </div>

              <div>
                <label htmlFor="field-location" className={labelCls}>
                  Lieu <span className="text-zinc-400">optionnel</span>
                </label>
                <Controller
                  name="location_id"
                  control={control}
                  render={({ field }) => (
                    <select
                      id="field-location"
                      value={field.value ?? ''}
                      onChange={(e) =>
                        field.onChange(e.target.value === '' ? null : Number(e.target.value))
                      }
                      className={inputCls}
                    >
                      <option value="">— Aucun lieu —</option>
                      {locations.map((loc) => (
                        <option key={loc.id} value={loc.id}>
                          {loc.name}
                        </option>
                      ))}
                    </select>
                  )}
                />

                {!showNewLocation ? (
                  <button
                    type="button"
                    onClick={() => setShowNewLocation(true)}
                    className="text-primary mt-1.5 text-xs hover:underline"
                  >
                    + Nouveau lieu
                  </button>
                ) : (
                  <div className="mt-2 flex gap-2">
                    <input
                      type="text"
                      value={newLocationName}
                      onChange={(e) => setNewLocationName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          handleCreateLocation()
                        }
                      }}
                      placeholder="Nom du lieu (ex : Stade du Parc)"
                      className={`${inputCls} flex-1`}
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={handleCreateLocation}
                      disabled={locationLoading || !newLocationName.trim()}
                      className="bg-primary hover:bg-primary-dark rounded-lg px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
                    >
                      {locationLoading ? '…' : 'Créer'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowNewLocation(false)
                        setNewLocationName('')
                      }}
                      className="rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-500 hover:bg-zinc-50"
                    >
                      Annuler
                    </button>
                  </div>
                )}
              </div>
            </>
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
            className="bg-primary hover:bg-primary-dark rounded-lg px-4 py-2 text-sm font-medium text-white"
          >
            Suivant →
          </button>
        ) : (
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-primary hover:bg-primary-dark rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
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
