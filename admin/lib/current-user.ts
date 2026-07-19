export interface StoredUser {
  id: string
  name: string
  email: string
  role?: string
  is_super_admin?: boolean
}

/**
 * Lit l'utilisateur connecté depuis le localStorage (stocké au login).
 * Retourne null côté serveur ou si aucun utilisateur n'est stocké.
 */
export function getCurrentUser(): StoredUser | null {
  if (typeof window === 'undefined') return null
  const raw = localStorage.getItem('user')
  if (!raw) return null
  try {
    return JSON.parse(raw) as StoredUser
  } catch {
    return null
  }
}

export function isSuperAdmin(): boolean {
  return getCurrentUser()?.is_super_admin === true
}
