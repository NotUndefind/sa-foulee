'use client'

import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuthStore } from '@/store/auth.store'
import { useRole } from '@/hooks/useRole'
import { updateProfile, getDocuments } from '@/lib/profile'
import type { UserDocument } from '@/types'
import DocumentCard from '@/components/features/documents/DocumentCard'
import DocumentUploadModal from '@/components/features/documents/DocumentUploadModal'

const schema = z.object({
  first_name: z.string().min(1, 'Le prénom est obligatoire.').max(50),
  last_name:  z.string().min(1, 'Le nom est obligatoire.').max(50),
  bio:        z.string().max(500, 'La bio ne peut pas dépasser 500 caractères.').optional(),
})
type FormValues = z.infer<typeof schema>

const ROLE_CONFIG: Record<string, { label: string; bg: string; color: string }> = {
  admin:   { label: 'Administrateur', bg: 'rgba(192,57,43,0.12)',   color: '#C0392B'  },
  founder: { label: 'Fondateur',      bg: 'rgba(146,43,33,0.12)',   color: '#922B21'  },
  coach:   { label: 'Entraîneur',     bg: 'rgba(169,50,38,0.12)',   color: '#A93226'  },
  bureau:  { label: 'Bureau',         bg: 'rgba(245,158,11,0.12)',  color: '#d97706'  },
  member:  { label: 'Membre',         bg: 'rgba(176,137,138,0.12)', color: '#5a8050'  },
}

function IconUser() {
  return (
    <svg width={26} height={26} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4"/>
      <path d="M4 20c0-4 3.58-7 8-7s8 3 8 7"/>
    </svg>
  )
}

function IconDocument() {
  return (
    <svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 13h6m-6 4h6M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>
      <path d="M14 3v6h6"/>
    </svg>
  )
}

export default function ProfilePage() {
  const { user, setUser } = useAuthStore()
  const { isAdmin }       = useRole()

  const [documents,    setDocuments]    = useState<UserDocument[]>([])
  const [showUpload,   setShowUpload]   = useState(false)
  const [saveSuccess,  setSaveSuccess]  = useState(false)
  const [globalError,  setGlobalError]  = useState<string | null>(null)
  const avatarRef                       = useRef<HTMLInputElement>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [avatarFile,    setAvatarFile]    = useState<File | null>(null)

  const { register, handleSubmit, reset, formState: { errors, isSubmitting, isDirty } } =
    useForm<FormValues>({
      resolver: zodResolver(schema),
      defaultValues: {
        first_name: user?.first_name ?? '',
        last_name:  user?.last_name  ?? '',
        bio:        user?.bio        ?? '',
      },
    })

  useEffect(() => {
    if (!user) return
    getDocuments(user.id).then(setDocuments).catch(() => {})
  }, [user])

  useEffect(() => {
    if (user) reset({ first_name: user.first_name, last_name: user.last_name, bio: user.bio ?? '' })
  }, [user, reset])

  const onSubmit = async (values: FormValues) => {
    setGlobalError(null); setSaveSuccess(false)
    try {
      const updated = await updateProfile({ ...values, avatar: avatarFile ?? undefined })
      setUser(updated); setAvatarFile(null); setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (err: unknown) {
      setGlobalError(err instanceof Error ? err.message : 'Erreur lors de la sauvegarde.')
    }
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  if (!user) {
    return (
      <div className="flex h-48 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2" style={{ borderColor: 'rgba(123,36,28,0.1)', borderTopColor: '#C0392B' }} />
      </div>
    )
  }

  const avatarSrc = avatarPreview ?? user.avatar ?? null
  const documentCompletion = user.document_completion ?? 0
  const initials = `${user.first_name?.[0] ?? ''}${user.last_name?.[0] ?? ''}`.toUpperCase()

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@400;500;600;700;800&display=swap');
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .pf-page { font-family: 'Baloo 2', sans-serif; }
        .pf-fade { animation: fadeUp 0.4s ease both; }
        .pf-card {
          background: white; border-radius: 20px;
          box-shadow: 0 2px 12px rgba(123,36,28,0.07);
          border: 1px solid rgba(123,36,28,0.08);
          overflow: hidden;
        }
        .pf-section-header {
          padding: 16px 24px;
          border-bottom: 1px solid rgba(123,36,28,0.07);
          background: linear-gradient(135deg, rgba(123,36,28,0.03) 0%, rgba(192,57,43,0.02) 100%);
        }
        .pf-input {
          width: 100%; border-radius: 12px; border: 1px solid rgba(123,36,28,0.15);
          padding: 10px 14px; font-size: 14px; transition: all 0.2s ease;
          outline: none; font-family: inherit; color: #7B241C;
        }
        .pf-input:focus { border-color: #C0392B; box-shadow: 0 0 0 3px rgba(192,57,43,0.1); }
        .pf-avatar-ring {
          background: linear-gradient(135deg, #7B241C 0%, #C0392B 100%);
          padding: 3px; border-radius: 50%; display: inline-block;
        }
        .pf-progress-bar {
          height: 6px; border-radius: 4px; overflow: hidden;
          background: rgba(123,36,28,0.06);
        }
      `}</style>

      <div className="pf-page min-h-screen pb-24 lg:pb-8" style={{ background: '#F8F8F8' }}>
        <div className="mx-auto max-w-2xl px-5 py-8 space-y-5">

          {/* ── Header ─────────────────────────────────────────────────── */}
          <div className="pf-fade" style={{ animationDelay: '0ms' }}>
            <div className="flex items-center gap-2 mb-1" style={{ color: '#A93226' }}>
              <IconUser />
              <h1 className="text-3xl font-extrabold" style={{ letterSpacing: '-0.02em', color: '#7B241C' }}>
                Mon profil
              </h1>
            </div>
            <p className="text-sm" style={{ color: '#B0898A' }}>Gérez vos informations personnelles et vos documents</p>
          </div>

          {/* ── Profile Hero Card ───────────────────────────────────────── */}
          <div className="pf-fade pf-card" style={{ animationDelay: '60ms' }}>
            {/* Avatar + identity */}
            <div className="flex items-center gap-5 px-6 py-6" style={{ background: 'linear-gradient(135deg, rgba(169,50,38,0.04) 0%, rgba(192,57,43,0.04) 100%)' }}>
              {/* Avatar */}
              <button
                type="button"
                onClick={() => avatarRef.current?.click()}
                className="group relative shrink-0"
                title="Changer l'avatar"
              >
                <div className="pf-avatar-ring">
                  <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-white">
                    {avatarSrc ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={avatarSrc} alt="Avatar" className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-xl font-bold" style={{ color: '#C0392B' }}>{initials}</span>
                    )}
                  </div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 transition group-hover:opacity-100">
                  <span className="text-[10px] font-bold text-white">Modifier</span>
                </div>
              </button>
              <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />

              {/* Name + roles */}
              <div className="min-w-0 flex-1">
                <p className="text-xl font-extrabold leading-tight" style={{ color: '#7B241C' }}>
                  {user.first_name} {user.last_name}
                </p>
                <p className="mb-2 text-sm" style={{ color: '#B0898A' }}>{user.email}</p>
                <div className="flex flex-wrap gap-1.5">
                  {user.roles.map((r) => {
                    const cfg = ROLE_CONFIG[r] ?? ROLE_CONFIG.member
                    return (
                      <span
                        key={r}
                        className="rounded-full px-2.5 py-0.5 text-xs font-bold"
                        style={{ background: cfg.bg, color: cfg.color }}
                      >
                        {cfg.label}
                      </span>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-4">
              {globalError && (
                <div className="rounded-xl px-4 py-3 text-sm font-medium" style={{ background: 'rgba(192,57,43,0.06)', border: '1px solid rgba(192,57,43,0.2)', color: '#922B21' }}>
                  {globalError}
                </div>
              )}
              {saveSuccess && (
                <div className="rounded-xl px-4 py-3 text-sm font-medium" style={{ background: 'rgba(169,50,38,0.06)', border: '1px solid rgba(169,50,38,0.25)', color: '#A93226' }}>
                  Profil mis à jour avec succès.
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider" style={{ color: '#B0898A' }}>Prénom</label>
                  <input {...register('first_name')} className="pf-input" />
                  {errors.first_name && <p className="mt-1 text-xs" style={{ color: '#922B21' }}>{errors.first_name.message}</p>}
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider" style={{ color: '#B0898A' }}>Nom</label>
                  <input {...register('last_name')} className="pf-input" />
                  {errors.last_name && <p className="mt-1 text-xs" style={{ color: '#922B21' }}>{errors.last_name.message}</p>}
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider" style={{ color: '#B0898A' }}>
                  Bio <span className="normal-case font-normal">— optionnel</span>
                </label>
                <textarea
                  {...register('bio')}
                  rows={3}
                  placeholder="Parle-nous un peu de toi…"
                  className="pf-input resize-none"
                />
                {errors.bio && <p className="mt-1 text-xs" style={{ color: '#922B21' }}>{errors.bio.message}</p>}
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  disabled={isSubmitting || (!isDirty && !avatarFile)}
                  className="rounded-xl px-6 py-2.5 text-sm font-bold text-white transition disabled:opacity-40"
                  style={{ background: 'linear-gradient(135deg, #C0392B 0%, #922B21 100%)', boxShadow: '0 2px 8px rgba(192,57,43,0.3)' }}
                >
                  {isSubmitting ? 'Enregistrement…' : 'Enregistrer les modifications'}
                </button>
              </div>
            </form>
          </div>

          {/* ── Documents section (masqué pour admin/founder) ────────────── */}
          {!isAdmin && (
            <div className="pf-fade pf-card" style={{ animationDelay: '100ms' }}>
              <div className="pf-section-header flex items-center justify-between">
                <div>
                  <h2 className="font-bold" style={{ color: '#7B241C' }}>Documents du dossier</h2>
                  <p className="mt-0.5 text-xs" style={{ color: '#B0898A' }}>
                    Dossier complété à {documentCompletion}%
                  </p>
                </div>
                <button
                  onClick={() => setShowUpload(true)}
                  className="rounded-xl px-4 py-2 text-xs font-bold text-white transition"
                  style={{ background: 'linear-gradient(135deg, #A93226 0%, #7B241C 100%)', boxShadow: '0 2px 6px rgba(123,36,28,0.25)' }}
                >
                  + Ajouter
                </button>
              </div>

              <div className="px-6 py-5">
                {/* Progress bar */}
                <div className="mb-5">
                  <div className="mb-1.5 flex items-center justify-between text-xs">
                    <span className="font-semibold" style={{ color: '#A93226' }}>Progression du dossier</span>
                    <span className="font-bold" style={{ color: documentCompletion === 100 ? '#A93226' : '#d97706' }}>
                      {documentCompletion}%
                    </span>
                  </div>
                  <div className="pf-progress-bar">
                    <div
                      style={{
                        height: '100%', borderRadius: '4px', transition: 'width 0.8s ease',
                        width: `${documentCompletion}%`,
                        background: documentCompletion === 100
                          ? 'linear-gradient(90deg, #C0392B, #7B241C)'
                          : 'linear-gradient(90deg, #f59e0b, #d97706)',
                      }}
                    />
                  </div>
                  {documentCompletion < 100 && (
                    <p className="mt-1.5 text-[11px]" style={{ color: '#B0898A' }}>
                      Complétez votre dossier pour participer aux événements du club.
                    </p>
                  )}
                  {documentCompletion === 100 && (
                    <p className="mt-1.5 text-[11px]" style={{ color: '#A93226' }}>
                      Dossier complet — vous pouvez participer à tous les événements.
                    </p>
                  )}
                </div>

                {documents.length === 0 ? (
                  <div className="flex flex-col items-center gap-2 py-6 text-center">
                    <div style={{ opacity: 0.25, color: '#A93226' }}><IconDocument /></div>
                    <p className="text-sm" style={{ color: '#B0898A' }}>Aucun document ajouté pour l&apos;instant.</p>
                    <button
                      onClick={() => setShowUpload(true)}
                      className="text-xs font-semibold hover:underline"
                      style={{ color: '#C0392B' }}
                    >
                      Ajouter mon premier document →
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {documents.map((doc) => (
                      <DocumentCard
                        key={doc.id}
                        document={doc}
                        onDeleted={(id) => setDocuments((prev) => prev.filter((d) => d.id !== id))}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>

      {!isAdmin && showUpload && (
        <DocumentUploadModal
          userId={user.id}
          onUploaded={(doc) => { setDocuments((prev) => [doc, ...prev]); setShowUpload(false) }}
          onClose={() => setShowUpload(false)}
        />
      )}
    </>
  )
}
