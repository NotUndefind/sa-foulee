'use client'

import type { Exercise } from '@/types'
import { X, Plus } from 'lucide-react'

interface Props {
  exercises: Exercise[]
  onChange: (exercises: Exercise[]) => void
}

const EMPTY_EXERCISE: Exercise = {
  name: '',
  sets: undefined,
  reps: undefined,
  duration: undefined,
  rest: undefined,
}

export default function ExerciseBuilder({ exercises, onChange }: Props) {
  const add = () => onChange([...exercises, { ...EMPTY_EXERCISE, _key: crypto.randomUUID() }])

  const remove = (idx: number) => onChange(exercises.filter((_, i) => i !== idx))

  const update = (idx: number, field: keyof Exercise, value: string) => {
    const updated = exercises.map((ex, i) => {
      if (i !== idx) return ex
      const numVal = value === '' ? undefined : Number(value)
      return { ...ex, [field]: field === 'name' ? value : numVal }
    })
    onChange(updated)
  }

  const inputCls =
    'rounded-lg border border-zinc-200 px-2 py-1 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20 w-full'
  const numCls = `${inputCls} text-center`

  return (
    <div className="space-y-3">
      {exercises.length === 0 ? (
        <p className="text-sm text-zinc-400 italic">Aucun exercice ajouté.</p>
      ) : (
        <>
          {/* En-tête colonnes */}
          <div className="grid grid-cols-[1fr_60px_60px_70px_60px_32px] gap-1.5 text-xs font-medium text-zinc-400">
            <span>Exercice</span>
            <span className="text-center">Séries</span>
            <span className="text-center">Rép.</span>
            <span className="text-center">Durée (s)</span>
            <span className="text-center">Repos (s)</span>
            <span />
          </div>

          {exercises.map((ex, idx) => (
            <div
              key={ex._key ?? idx}
              className="grid grid-cols-[1fr_60px_60px_70px_60px_32px] items-center gap-1.5"
            >
              <input
                value={ex.name}
                onChange={(e) => update(idx, 'name', e.target.value)}
                placeholder="Ex: Gainage"
                className={inputCls}
              />
              <input
                type="number"
                min="1"
                value={ex.sets ?? ''}
                onChange={(e) => update(idx, 'sets', e.target.value)}
                placeholder="—"
                className={numCls}
              />
              <input
                type="number"
                min="1"
                value={ex.reps ?? ''}
                onChange={(e) => update(idx, 'reps', e.target.value)}
                placeholder="—"
                className={numCls}
              />
              <input
                type="number"
                min="1"
                value={ex.duration ?? ''}
                onChange={(e) => update(idx, 'duration', e.target.value)}
                placeholder="—"
                className={numCls}
              />
              <input
                type="number"
                min="0"
                value={ex.rest ?? ''}
                onChange={(e) => update(idx, 'rest', e.target.value)}
                placeholder="—"
                className={numCls}
              />
              <button
                type="button"
                onClick={() => remove(idx)}
                aria-label="Supprimer l'exercice"
                className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-400 transition hover:bg-red-50 hover:text-red-500"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </>
      )}

      <button
        type="button"
        onClick={add}
        className="hover:border-primary hover:text-primary flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-zinc-300 px-3 py-2 text-sm text-zinc-500 transition"
      >
        <Plus size={14} /> Ajouter un exercice
      </button>
    </div>
  )
}
