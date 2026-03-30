'use client'

import { useState } from 'react'
import { toggleNewsletter } from '@/lib/newsletter'
import { useAuthStore } from '@/store/auth.store'
import type { User } from '@/types'

function IconMail() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2"/>
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
    </svg>
  )
}

function IconCheck() {
  return (
    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5"/>
    </svg>
  )
}

interface Props {
  initialSubscribed: boolean
}

export default function NewsletterToggle({ initialSubscribed }: Props) {
  const { user, setUser } = useAuthStore()
  const [subscribed, setSubscribed] = useState(initialSubscribed)
  const [loading,    setLoading]    = useState(false)
  const [toast,      setToast]      = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleToggle = async () => {
    if (loading) return
    const next = !subscribed
    setLoading(true)
    try {
      const res = await toggleNewsletter(next)
      setSubscribed(res.subscribed)
      // Mettre à jour le store pour que newsletter_subscribed_at soit à jour
      if (user) {
        setUser({ ...(user as User), newsletter_subscribed_at: res.newsletter_subscribed_at })
      }
      showToast(
        res.subscribed ? 'Abonné à la newsletter.' : 'Désabonné de la newsletter.',
        'success'
      )
    } catch {
      showToast('Une erreur est survenue. Réessaie.', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ position: 'relative' }}>
      <style>{`
        .nl-toggle-row {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          padding: 20px 24px;
        }
        .nl-icon-wrap {
          flex-shrink: 0;
          width: 40px; height: 40px;
          border-radius: 10px;
          background: rgba(251,57,54,0.08);
          display: flex; align-items: center; justify-content: center;
          color: #FB3936;
        }
        .nl-content { flex: 1; }
        .nl-title {
          font-size: 15px; font-weight: 600; color: #1A1A1A; margin-bottom: 4px;
        }
        .nl-desc {
          font-size: 13px; color: #7F7F7F; line-height: 1.5;
        }
        .nl-switch {
          flex-shrink: 0;
          position: relative; display: inline-flex; align-items: center;
          width: 48px; height: 26px;
          border-radius: 13px;
          cursor: pointer;
          transition: background 0.25s ease;
          outline: none; border: none; padding: 0;
        }
        .nl-switch:focus-visible { box-shadow: 0 0 0 3px rgba(251,57,54,0.25); }
        .nl-switch:disabled { opacity: 0.5; cursor: not-allowed; }
        .nl-thumb {
          position: absolute;
          left: 3px;
          width: 20px; height: 20px;
          border-radius: 50%;
          background: white;
          box-shadow: 0 1px 4px rgba(0,0,0,0.18);
          transition: transform 0.25s ease;
          display: flex; align-items: center; justify-content: center;
        }
        .nl-thumb-on  { transform: translateX(22px); }
        .nl-thumb-off { transform: translateX(0);    }
        .nl-toast {
          position: fixed; bottom: 24px; right: 24px; z-index: 999;
          padding: 12px 18px;
          border-radius: 12px;
          font-size: 14px; font-weight: 500;
          box-shadow: 0 4px 16px rgba(0,0,0,0.12);
          animation: nlFadeUp 0.25s ease;
        }
        @keyframes nlFadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="nl-toggle-row">
        <div className="nl-icon-wrap">
          <IconMail />
        </div>

        <div className="nl-content">
          <p className="nl-title">Newsletter du club</p>
          <p className="nl-desc">
            Reçois les actualités de La Neuville TAF sa Foulée : sorties, événements, résultats de courses et infos du bureau.
          </p>
        </div>

        <button
          type="button"
          role="switch"
          aria-checked={subscribed}
          onClick={handleToggle}
          disabled={loading}
          className="nl-switch"
          style={{ background: subscribed ? '#FB3936' : 'rgba(0,0,0,0.12)' }}
        >
          <span className={`nl-thumb ${subscribed ? 'nl-thumb-on' : 'nl-thumb-off'}`}>
            {subscribed && <IconCheck />}
          </span>
        </button>
      </div>

      {toast && (
        <div
          className="nl-toast"
          style={{
            background: toast.type === 'success' ? '#fff' : '#fff1f0',
            color:      toast.type === 'success' ? '#1A1A1A' : '#c0392b',
            border:     toast.type === 'success'
              ? '1px solid rgba(251,57,54,0.2)'
              : '1px solid rgba(192,57,43,0.3)',
          }}
        >
          {toast.message}
        </div>
      )}
    </div>
  )
}
