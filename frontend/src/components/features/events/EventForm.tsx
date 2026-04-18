'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { Event, EventType } from '@/types'
import { createEvent, updateEvent, type EventPayload } from '@/lib/events'

const schema = z.object({
  title: z.string().min(3, 'Titre trop court').max(255),
  description: z.string().min(10, 'Description trop courte').max(5000),
  type: z.enum(['race', 'outing', 'competition', 'other'] as const),
  event_date: z.string().min(1, 'Date obligatoire'),
  location: z.string().min(2, 'Lieu obligatoire').max(255),
  is_public: z.boolean(),
})

type FormData = z.infer<typeof schema>

const TYPE_OPTIONS: { value: EventType; label: string }[] = [
  { value: 'race', label: 'Course' },
  { value: 'outing', label: 'Sortie' },
  { value: 'competition', label: 'Compétition' },
  { value: 'other', label: 'Autre' },
]

interface Props {
  event?: Event // si présent → mode édition
  onSuccess: (event: Event) => void
  onCancel: () => void
}

export default function EventForm({ event, onSuccess, onCancel }: Props) {
  const isEdit = !!event

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: event?.title ?? '',
      description: event?.description ?? '',
      type: event?.type ?? 'outing',
      // Formate la date ISO en "YYYY-MM-DDTHH:MM" pour l'input datetime-local
      event_date: event?.event_date ? new Date(event.event_date).toISOString().slice(0, 16) : '',
      location: event?.location ?? '',
      is_public: event?.is_public ?? true,
    },
  })

  useEffect(() => {
    reset({
      title: event?.title ?? '',
      description: event?.description ?? '',
      type: event?.type ?? 'outing',
      event_date: event?.event_date ? new Date(event.event_date).toISOString().slice(0, 16) : '',
      location: event?.location ?? '',
      is_public: event?.is_public ?? true,
    })
  }, [event, reset])

  const onSubmit = async (data: FormData) => {
    const payload: EventPayload = {
      ...data,
      // Convertit en ISO full (le backend accepte datetime)
      event_date: new Date(data.event_date).toISOString(),
    }
    try {
      const saved = isEdit ? await updateEvent(event!.id, payload) : await createEvent(payload)
      onSuccess(saved)
    } catch (err: unknown) {
      const apiErr = err as { errors?: Record<string, string[]> }
      if (apiErr.errors) {
        Object.entries(apiErr.errors).forEach(([field, msgs]) => {
          setError(field as keyof FormData, { message: msgs[0] })
        })
      }
    }
  }

  const inputClass =
    'w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20'
  const errorClass = 'mt-1 text-xs text-red-600'
  const labelClass = 'block text-sm font-medium text-zinc-700 mb-1'

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Titre */}
      <div>
        <label className={labelClass}>Titre</label>
        <input
          {...register('title')}
          placeholder="Ex: Sortie trail dimanche"
          className={inputClass}
        />
        {errors.title && <p className={errorClass}>{errors.title.message}</p>}
      </div>

      {/* Description */}
      <div>
        <label className={labelClass}>Description</label>
        <textarea
          {...register('description')}
          rows={3}
          placeholder="Décrivez l'événement…"
          className={inputClass}
        />
        {errors.description && <p className={errorClass}>{errors.description.message}</p>}
      </div>

      {/* Type + Date */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Type</label>
          <select {...register('type')} className={inputClass}>
            {TYPE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          {errors.type && <p className={errorClass}>{errors.type.message}</p>}
        </div>
        <div>
          <label className={labelClass}>Date et heure</label>
          <input {...register('event_date')} type="datetime-local" className={inputClass} />
          {errors.event_date && <p className={errorClass}>{errors.event_date.message}</p>}
        </div>
      </div>

      {/* Lieu */}
      <div>
        <label className={labelClass}>Lieu</label>
        <input {...register('location')} placeholder="Ex: Forêt de Meudon" className={inputClass} />
        {errors.location && <p className={errorClass}>{errors.location.message}</p>}
      </div>

      {/* Visibilité */}
      <label className="flex cursor-pointer items-center gap-3">
        <input
          {...register('is_public')}
          type="checkbox"
          className="accent-primary h-4 w-4 rounded"
        />
        <span className="text-sm text-zinc-700">
          Événement public (visible par tous les membres)
        </span>
      </label>

      {/* Boutons */}
      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-zinc-300 px-4 py-2 text-sm text-zinc-600 hover:bg-zinc-50"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-primary hover:bg-primary-dark rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {isSubmitting ? 'Enregistrement…' : isEdit ? 'Modifier' : 'Créer'}
        </button>
      </div>
    </form>
  )
}
