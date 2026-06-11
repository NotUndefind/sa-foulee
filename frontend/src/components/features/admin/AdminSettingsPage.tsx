'use client'

import { useToast } from '@/components/ui/Toast'
import { getAdminSettings, updateSetting, type AdminSetting } from '@/lib/settings'
import { useEffect, useState } from 'react'

export default function AdminSettingsPage() {
  const { toast } = useToast()
  const [settings, setSettings] = useState<AdminSetting[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)

  useEffect(() => {
    getAdminSettings()
      .then(setSettings)
      .catch(() => toast('Erreur lors du chargement des paramètres.', 'error'))
      .finally(() => setLoading(false))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleToggle = async (key: string, currentValue: string | null) => {
    const newValue = currentValue === 'true' ? 'false' : 'true'
    setSaving(key)
    try {
      const updated = await updateSetting(key, newValue)
      setSettings((s) =>
        s.map((setting) => (setting.key === key ? { ...setting, value: updated.value } : setting))
      )
      toast('Paramètre mis à jour.', 'success')
    } catch {
      toast('Erreur lors de la mise à jour.', 'error')
    } finally {
      setSaving(null)
    }
  }

  const SETTING_LABELS: Record<string, { label: string; desc: string }> = {
    leaderboard_enabled: {
      label: 'Classement actif',
      desc: 'Afficher le classement des membres. Si désactivé, le lien est masqué dans la sidebar et la page affiche un message.',
    },
  }

  return (
    <div
      className="min-h-screen pb-24 lg:pb-8"
      style={{ background: '#F8F8F8', fontFamily: "'Baloo 2', sans-serif" }}
    >
      <div className="mx-auto max-w-2xl px-5 py-8">
        <div className="mb-8">
          <h1
            className="text-3xl font-extrabold"
            style={{ color: '#C0302E', letterSpacing: '-0.02em' }}
          >
            Paramètres
          </h1>
          <p className="mt-1 text-sm" style={{ color: '#7F7F7F' }}>
            Configuration de l&apos;application — visible uniquement des admins et fondateurs.
          </p>
        </div>

        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <div
              className="h-7 w-7 animate-spin rounded-full border-2"
              style={{ borderColor: 'rgba(192,48,46,0.1)', borderTopColor: '#FB3936' }}
            />
          </div>
        ) : (
          <div className="space-y-4">
            {settings.map((setting) => {
              const meta = SETTING_LABELS[setting.key]
              const isOn = setting.value === 'true'
              const isSaving = saving === setting.key

              return (
                <div
                  key={setting.key}
                  className="rounded-2xl bg-white p-5"
                  style={{
                    border: '1px solid rgba(192,48,46,0.08)',
                    boxShadow: '0 2px 8px rgba(251,57,54,0.04)',
                  }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="font-semibold" style={{ color: '#1A1A1A' }}>
                        {meta?.label ?? setting.key}
                      </p>
                      {meta?.desc && (
                        <p className="mt-1 text-sm" style={{ color: '#7F7F7F' }}>
                          {meta.desc}
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      role="switch"
                      aria-checked={isOn}
                      disabled={isSaving}
                      onClick={() => handleToggle(setting.key, setting.value)}
                      className="relative shrink-0 rounded-full transition disabled:opacity-50"
                      style={{
                        width: 48,
                        height: 26,
                        background: isOn ? '#FB3936' : 'rgba(0,0,0,0.12)',
                        border: 'none',
                        cursor: isSaving ? 'not-allowed' : 'pointer',
                      }}
                    >
                      <span
                        style={{
                          position: 'absolute',
                          top: 3,
                          left: isOn ? 25 : 3,
                          width: 20,
                          height: 20,
                          borderRadius: '50%',
                          background: 'white',
                          boxShadow: '0 1px 4px rgba(0,0,0,0.18)',
                          transition: 'left 0.25s ease',
                        }}
                      />
                    </button>
                  </div>

                  <p className="mt-3 text-xs" style={{ color: '#7F7F7F' }}>
                    Statut actuel :{' '}
                    <span style={{ fontWeight: 600, color: isOn ? '#C0302E' : '#7F7F7F' }}>
                      {isOn ? 'Activé' : 'Désactivé'}
                    </span>
                  </p>
                </div>
              )
            })}

            {settings.length === 0 && (
              <p className="text-sm" style={{ color: '#7F7F7F' }}>
                Aucun paramètre configuré.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
