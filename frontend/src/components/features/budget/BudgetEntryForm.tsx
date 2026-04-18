'use client'

import { useEffect } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createBudgetEntry, updateBudgetEntry } from '@/lib/budget'
import type { BudgetEntry } from '@/types'

// ─── Schema ───────────────────────────────────────────────────────────────────

const schema = z.object({
  type: z.enum(['recette', 'depense']),
  category: z.string().min(1, 'La catégorie est requise.').max(100),
  amount: z.number({ error: 'Montant invalide.' }).positive('Le montant doit être supérieur à 0.'),
  description: z.string().min(1, 'La description est requise.').max(2000),
  entry_date: z.string().min(1, 'La date est requise.'),
  receipt_url: z.url('URL invalide.').or(z.literal('')).optional(),
})

type FormValues = z.infer

// ─── Category suggestions ─────────────────────────────────────────────────────

const CATEGORIES_RECETTE = ['cotisation', 'subvention', 'don', 'vente', 'helloasso', 'autre']
const CATEGORIES_DEPENSE = [
  'matériel',
  'déplacement',
  'restauration',
  'communication',
  'assurance',
  'location',
  'autre',
]

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  /** Si fourni, on est en mode édition */
  entry?: BudgetEntry
  /** Type pré-sélectionné (mode création rapide) */
  defaultType?: 'recette' | 'depense'
  onSaved: (entry: BudgetEntry) => void
  onCancel: () => void
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function BudgetEntryForm({
  entry,
  defaultType = 'depense',
  onSaved,
  onCancel,
}: Props) {
  const isEdit = !!entry

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: entry?.type ?? defaultType,
      category: entry?.category ?? '',
      amount: entry?.amount ?? (undefined as unknown as number),
      description: entry?.description ?? '',
      entry_date: entry?.entry_date ?? new Date().toISOString().slice(0, 10),
      receipt_url: entry?.receipt_url ?? '',
    },
  })

  const typeValue = useWatch({ control, name: 'type' })
  const categories = typeValue === 'recette' ? CATEGORIES_RECETTE : CATEGORIES_DEPENSE

  // Reset category when type changes (only in create mode)
  useEffect(() => {
    if (!isEdit) setValue('category', '')
  }, [typeValue, isEdit, setValue])

  const onSubmit = async (data: FormValues) => {
    const payload = {
      type: data.type,
      category: data.category,
      amount: data.amount,
      description: data.description,
      entry_date: data.entry_date,
      receipt_url: data.receipt_url || undefined,
    }
    const saved = isEdit
      ? await updateBudgetEntry(entry!.id, payload)
      : await createBudgetEntry(payload)
    onSaved(saved)
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        background: 'rgba(0,0,0,0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div
        style={{
          background: 'white',
          borderRadius: '20px',
          padding: '28px 32px',
          maxWidth: '480px',
          width: '100%',
          boxShadow: '0 8px 40px rgba(0,0,0,0.16)',
          fontFamily: "'Baloo 2', sans-serif",
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1A1A1A', marginBottom: '4px' }}>
          {isEdit
            ? 'Modifier le mouvement'
            : typeValue === 'recette'
              ? 'Ajouter une recette'
              : 'Ajouter une dépense'}
        </h3>
        <p style={{ fontSize: '13px', color: '#7F7F7F', marginBottom: '20px' }}>
          {isEdit ? entry!.category : 'Remplissez les informations ci-dessous.'}
        </p>

        <form
          onSubmit={handleSubmit(onSubmit)}
          style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}
        >
          {/* Type */}
          {!isEdit && (
            <div>
              <Label>Type *</Label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {(['depense', 'recette'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setValue('type', t)}
                    style={{
                      flex: 1,
                      padding: '9px',
                      borderRadius: '10px',
                      fontSize: '13.5px',
                      fontWeight: 700,
                      border: '1.5px solid',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      transition: 'all 0.15s',
                      ...(typeValue === t
                        ? t === 'depense'
                          ? {
                              background: 'rgba(251,57,54,0.08)',
                              borderColor: '#FB3936',
                              color: '#D42F2D',
                            }
                          : {
                              background: 'rgba(5,150,105,0.08)',
                              borderColor: '#059669',
                              color: '#059669',
                            }
                        : {
                            background: 'white',
                            borderColor: 'rgba(192,48,46,0.15)',
                            color: '#7F7F7F',
                          }),
                    }}
                  >
                    {t === 'depense' ? 'Dépense' : 'Recette'}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Catégorie */}
          <div>
            <Label>Catégorie *</Label>
            <select {...register('category')} style={inputStyle(!!errors.category)}>
              <option value="">Sélectionner…</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c.charAt(0).toUpperCase() + c.slice(1)}
                </option>
              ))}
            </select>
            {errors.category && <ErrorMsg>{errors.category.message}</ErrorMsg>}
          </div>

          {/* Montant */}
          <div>
            <Label>Montant (€) *</Label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0,00"
              {...register('amount', { valueAsNumber: true })}
              style={inputStyle(!!errors.amount)}
            />
            {errors.amount && <ErrorMsg>{errors.amount.message}</ErrorMsg>}
          </div>

          {/* Date */}
          <div>
            <Label>Date *</Label>
            <input
              type="date"
              {...register('entry_date')}
              style={inputStyle(!!errors.entry_date)}
            />
            {errors.entry_date && <ErrorMsg>{errors.entry_date.message}</ErrorMsg>}
          </div>

          {/* Description */}
          <div>
            <Label>Description *</Label>
            <textarea
              rows={2}
              placeholder="Ex : Achat de dossards pour la course du 15 mai…"
              {...register('description')}
              style={{ ...inputStyle(!!errors.description), resize: 'none' }}
            />
            {errors.description && <ErrorMsg>{errors.description.message}</ErrorMsg>}
          </div>

          {/* Justificatif */}
          <div>
            <Label>
              Lien justificatif{' '}
              <span
                style={{
                  color: '#7F7F7F',
                  fontWeight: 400,
                  textTransform: 'none',
                  letterSpacing: 0,
                  fontSize: '12px',
                }}
              >
                — optionnel
              </span>
            </Label>
            <input
              type="url"
              placeholder="https://…"
              {...register('receipt_url')}
              style={inputStyle(!!errors.receipt_url)}
            />
            {errors.receipt_url && <ErrorMsg>{errors.receipt_url.message}</ErrorMsg>}
          </div>

          {/* Actions */}
          <div
            style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}
          >
            <button
              type="button"
              onClick={onCancel}
              style={{
                borderRadius: '12px',
                padding: '9px 20px',
                fontSize: '13.5px',
                fontWeight: 700,
                color: '#2C2C2C',
                background: 'rgba(0,0,0,0.06)',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                borderRadius: '12px',
                padding: '9px 20px',
                fontSize: '13.5px',
                fontWeight: 700,
                color: 'white',
                background: 'linear-gradient(135deg, #FB3936 0%, #D42F2D 100%)',
                boxShadow: '0 2px 8px rgba(251,57,54,0.3)',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'inherit',
                opacity: isSubmitting ? 0.5 : 1,
              }}
            >
              {isSubmitting ? 'Enregistrement…' : isEdit ? 'Modifier' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Small helpers ─────────────────────────────────────────────────────────────

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label
      style={{
        display: 'block',
        fontSize: '11px',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        color: '#7F7F7F',
        marginBottom: '6px',
      }}
    >
      {children}
    </label>
  )
}

function ErrorMsg({ children }: { children: React.ReactNode }) {
  return <p style={{ fontSize: '12px', color: '#D42F2D', marginTop: '4px' }}>{children}</p>
}

function inputStyle(hasError: boolean): React.CSSProperties {
  return {
    width: '100%',
    border: `1px solid ${hasError ? '#FB3936' : 'rgba(192,48,46,0.15)'}`,
    borderRadius: '10px',
    padding: '9px 12px',
    fontSize: '14px',
    outline: 'none',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
    background: 'white',
  }
}
