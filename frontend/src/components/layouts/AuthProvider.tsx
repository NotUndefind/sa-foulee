'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/store/auth.store'
import { api, ApiError } from '@/lib/api'
import type { User } from '@/types'

/**
 * AuthProvider — Composant client racine.
 *
 * Au montage, vérifie si un token existe dans localStorage.
 * Si oui, appelle GET /me pour restaurer la session utilisateur.
 * Doit être placé dans le RootLayout pour couvrir toute l'app.
 */
export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setLoading } = useAuthStore()

  useEffect(() => {
    const token = localStorage.getItem('auth_token')

    if (!token) {
      setLoading(false)
      return
    }

    api
      .get<User>('/me')
      .then((user) => setUser(user))
      .catch((err) => {
        // Token expiré ou révoqué → nettoyer
        if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
          localStorage.removeItem('auth_token')
        }
        setLoading(false)
      })
  }, [setUser, setLoading])

  return <>{children}</>
}
