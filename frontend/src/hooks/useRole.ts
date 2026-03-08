import { useAuthStore } from '@/store/auth.store'
import type { Role } from '@/types'

// Hiérarchie des rôles (du plus élevé au plus bas)
const ROLE_HIERARCHY: Role[] = ['admin', 'founder', 'coach', 'bureau', 'member']

/**
 * Retourne des helpers pour vérifier les rôles de l'utilisateur connecté.
 *
 * @example
 * const { hasRole, hasAnyRole, isAdmin, canPublish } = useRole()
 * if (canPublish) { ... }
 */
export function useRole() {
  const user = useAuthStore((s) => s.user)
  const roles: Role[] = user?.roles ?? []

  /** Vérifie si l'utilisateur possède exactement ce rôle */
  const hasRole = (role: Role): boolean => roles.includes(role)

  /** Vérifie si l'utilisateur possède au moins un des rôles listés */
  const hasAnyRole = (...required: Role[]): boolean =>
    required.some((r) => roles.includes(r))

  /** Retourne le rôle le plus élevé de l'utilisateur */
  const primaryRole: Role | null =
    ROLE_HIERARCHY.find((r) => roles.includes(r)) ?? null

  // ---- Raccourcis sémantiques ----

  /** Accès total à l'application */
  const isAdmin = hasRole('admin')

  /** Peut créer des sessions d'entraînement */
  const canManageSessions = hasAnyRole('admin', 'founder', 'coach')

  /** Peut créer des événements */
  const canManageEvents = hasAnyRole('admin', 'founder', 'bureau')

  /** Peut publier des articles de blog */
  const canPublish = hasAnyRole('admin', 'founder', 'coach', 'bureau')

  /** Peut accéder au panneau d'administration */
  const canManageUsers = hasAnyRole('admin', 'founder')

  /** Peut valider les documents des membres */
  const canValidateDocuments = hasAnyRole('admin', 'founder')

  return {
    roles,
    primaryRole,
    hasRole,
    hasAnyRole,
    isAdmin,
    canManageSessions,
    canManageEvents,
    canPublish,
    canManageUsers,
    canValidateDocuments,
  }
}
