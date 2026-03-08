import type { Role } from '@/types'
import { useRole } from '@/hooks/useRole'

interface Props {
  /** Rôles autorisés à voir le contenu */
  roles: Role[]
  /** Contenu affiché si l'utilisateur a le bon rôle */
  children: React.ReactNode
  /** Contenu affiché si l'utilisateur n'a pas le rôle (optionnel) */
  fallback?: React.ReactNode
}

/**
 * Affiche `children` uniquement si l'utilisateur possède
 * au moins un des rôles listés dans `roles`.
 *
 * @example
 * <RoleGate roles={['admin', 'founder']}>
 *   <button>Créer un événement</button>
 * </RoleGate>
 */
export default function RoleGate({ roles, children, fallback = null }: Props) {
  const { hasAnyRole } = useRole()

  if (!hasAnyRole(...roles)) return <>{fallback}</>

  return <>{children}</>
}
