'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

type Status = 'loading' | 'success' | 'invalid' | 'error'

async function postUnsubscribe(token: string): Promise {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1'}/newsletter/unsubscribe`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ token }),
    }
  )
  if (res.status === 404) throw new Error('invalid')
  if (!res.ok) throw new Error('error')
}

function DesabonnementContent() {
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<Status>('loading')

  useEffect(() => {
    const token = searchParams.get('token')

    Promise.resolve(token)
      .then((t) => {
        if (!t) return Promise.reject(new Error('invalid'))
        return postUnsubscribe(t)
      })
      .then(() => setStatus('success'))
      .catch((err: Error) => {
        setStatus(err.message === 'invalid' ? 'invalid' : 'error')
      })
  }, [searchParams])

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@400;500;600;700;800&display=swap');
        .unsub-page { font-family: 'Baloo 2', sans-serif; }
      `}</style>

      <div
        className="unsub-page flex min-h-screen items-center justify-center px-5"
        style={{ background: '#F8F8F8' }}
      >
        <div
          style={{
            background: 'white',
            borderRadius: '24px',
            boxShadow: '0 4px 24px rgba(192,48,46,0.08)',
            border: '1px solid rgba(192,48,46,0.08)',
            padding: '48px 40px',
            maxWidth: '420px',
            width: '100%',
            textAlign: 'center',
          }}
        >
          {status === 'loading' && (
            <>
              <div
                className="mx-auto mb-6 h-10 w-10 animate-spin rounded-full border-2"
                style={{ borderColor: 'rgba(192,48,46,0.1)', borderTopColor: '#FB3936' }}
              />
              <p style={{ color: '#7F7F7F', fontSize: '15px' }}>Traitement en cours…</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  background: 'rgba(251,57,54,0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px',
                }}
              >
                <svg
                  width={28}
                  height={28}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#FB3936"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              </div>
              <h1
                style={{ fontSize: '22px', fontWeight: 800, color: '#1A1A1A', marginBottom: '8px' }}
              >
                Désabonnement confirmé
              </h1>
              <p
                style={{
                  fontSize: '14px',
                  color: '#7F7F7F',
                  lineHeight: 1.6,
                  marginBottom: '28px',
                }}
              >
                Vous avez bien été désabonné(e) de la newsletter de La Neuville TAF sa Foulée. Vous
                ne recevrez plus nos emails.
              </p>
              <Link
                href="/"
                style={{
                  display: 'inline-block',
                  padding: '10px 24px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #FB3936 0%, #D42F2D 100%)',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '14px',
                  textDecoration: 'none',
                  boxShadow: '0 2px 8px rgba(251,57,54,0.3)',
                }}
              >
                Retour à l&apos;accueil
              </Link>
            </>
          )}

          {(status === 'invalid' || status === 'error') && (
            <>
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  background: 'rgba(251,57,54,0.06)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px',
                }}
              >
                <svg
                  width={28}
                  height={28}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#D42F2D"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
              <h1
                style={{ fontSize: '22px', fontWeight: 800, color: '#1A1A1A', marginBottom: '8px' }}
              >
                {status === 'invalid' ? "Ce lien n'est plus valide." : 'Une erreur est survenue.'}
              </h1>
              <p
                style={{
                  fontSize: '14px',
                  color: '#7F7F7F',
                  lineHeight: 1.6,
                  marginBottom: '28px',
                }}
              >
                {status === 'invalid'
                  ? 'Ce lien de désabonnement a peut-être déjà été utilisé ou est expiré.'
                  : 'Impossible de traiter votre demande. Réessayez dans quelques instants.'}
              </p>
              <Link
                href="/"
                style={{
                  display: 'inline-block',
                  padding: '10px 24px',
                  borderRadius: '12px',
                  background: 'rgba(192,48,46,0.08)',
                  color: '#D42F2D',
                  fontWeight: 700,
                  fontSize: '14px',
                  textDecoration: 'none',
                }}
              >
                Retour à l&apos;accueil
              </Link>
            </>
          )}
        </div>
      </div>
    </>
  )
}

export default function DesabonnementPage() {
  return (
    <Suspense>
      <DesabonnementContent />
    </Suspense>
  )
}
