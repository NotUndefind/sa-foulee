'use client'

import * as Sentry from '@sentry/nextjs'
import { useEffect } from 'react'

// Capture les erreurs fatales du root layout (remplace l'écran blanc).
export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <html lang="fr">
      <body>
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            fontFamily: 'sans-serif',
            background: '#FAFAFA',
          }}
        >
          <h1 style={{ color: '#C0302E', fontSize: '20px' }}>Une erreur est survenue.</h1>
          <p style={{ color: '#7F7F7F', fontSize: '14px' }}>
            Rechargez la page ou réessayez dans quelques instants.
          </p>
          {/* <a> natif volontaire : global-error remplace le root layout, le router peut être indisponible. */}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a href="/" style={{ color: '#FB3936', fontSize: '14px' }}>
            Retour à l&apos;accueil
          </a>
        </div>
      </body>
    </html>
  )
}
