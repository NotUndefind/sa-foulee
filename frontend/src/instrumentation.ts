import * as Sentry from '@sentry/nextjs'

// Initialisation Sentry côté serveur (Node + Edge). No-op si le DSN est absent.
export function register() {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    tracesSampleRate: 0.1,
    enabled: Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN),
  })
}

export const onRequestError = Sentry.captureRequestError
