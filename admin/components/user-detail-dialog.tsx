'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  AlertTriangle,
  CheckCircle2,
  KeyRound,
  Mail,
  Phone,
  ShieldCheck,
  Trash2,
  UserCog,
  X,
} from 'lucide-react'
import {
  deleteUser,
  getAdminUser,
  resetUserPassword,
  updateUserRole,
} from '@/lib/api/admin'
import { isSuperAdmin } from '@/lib/current-user'
import { cn } from '@/lib/utils'
import type { AdminDriver, AdminUser, AdminUserDetail } from '@/types/admin'

type ListedUser = AdminUser | AdminDriver

interface UserDetailDialogProps {
  user: ListedUser
  title?: string
  onClose: () => void
  onDeleted?: (userId: string) => void
  onUpdated?: (user: Partial<ListedUser> & { id: string }) => void
  onToggleDriverActive?: (user: AdminDriver) => Promise<void>
}

const ROLE_OPTIONS = [
  { value: 'client', label: 'Client' },
  { value: 'driver', label: 'Livreur' },
  { value: 'admin', label: 'Admin' },
]

export default function UserDetailDialog({
  user,
  title = 'Détails utilisateur',
  onClose,
  onDeleted,
  onUpdated,
  onToggleDriverActive,
}: UserDetailDialogProps) {
  const [detail, setDetail] = useState<AdminUserDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [allowed, setAllowed] = useState(false)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [role, setRole] = useState(user.role ?? '')
  const [action, setAction] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setAllowed(isSuperAdmin())
  }, [])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    getAdminUser(user.id)
      .then((res) => {
        if (cancelled) return
        setDetail(res)
        setRole(res.role)
      })
      .catch(() => {
        if (!cancelled) setDetail(null)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [user.id])

  useEffect(() => {
    function onEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onEsc)
    return () => document.removeEventListener('keydown', onEsc)
  }, [onClose])

  const merged = useMemo(() => ({ ...user, ...(detail ?? {}) }), [detail, user])
  const isDriver = merged.role === 'driver'
  const isActive = 'is_active' in user ? user.is_active !== false : true

  async function runAction(name: string, callback: () => Promise<void>) {
    setAction(name)
    setError(null)
    setMessage(null)
    try {
      await callback()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue.')
    } finally {
      setAction(null)
    }
  }

  function formatDate(dateStr?: string): string {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })
  }

  async function handlePasswordReset() {
    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.')
      return
    }
    if (password !== confirm) {
      setError('Les deux mots de passe ne correspondent pas.')
      return
    }
    await runAction('password', async () => {
      await resetUserPassword(user.id, password)
      setPassword('')
      setConfirm('')
      setMessage('Mot de passe réinitialisé. L’utilisateur devra le changer à la prochaine connexion.')
    })
  }

  async function handleRoleChange() {
    if (!role || role === merged.role) return
    await runAction('role', async () => {
      const updated = await updateUserRole(user.id, role)
      setDetail((prev) => prev ? { ...prev, role: updated.role } : prev)
      onUpdated?.({ id: user.id, role: updated.role })
      setMessage(`Rôle modifié en ${roleLabel(updated.role)}.`)
    })
  }

  async function handleDelete() {
    await runAction('delete', async () => {
      await deleteUser(user.id)
      onDeleted?.(user.id)
      onClose()
    })
  }

  async function handleToggleDriver() {
    if (!isDriver || !onToggleDriverActive || !('is_active' in user)) return
    await runAction('toggle-driver', async () => {
      await onToggleDriverActive(user as AdminDriver)
      onUpdated?.({ id: user.id, is_active: !isActive } as Partial<ListedUser> & { id: string })
      setMessage(isActive ? 'Livreur désactivé.' : 'Livreur réactivé.')
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden="true" />
      <div className="relative z-10 flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
        <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
          <div>
            <p className="text-xs font-semibold text-muted-foreground">{title}</p>
            <h2 className="mt-1 text-xl font-bold text-foreground">{merged.name}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-muted-foreground transition hover:bg-muted/30 hover:text-foreground"
            aria-label="Fermer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto px-5 py-5">
          {loading ? (
            <div className="space-y-3">
              <div className="h-16 rounded-xl bg-muted animate-pulse" />
              <div className="h-32 rounded-xl bg-muted animate-pulse" />
            </div>
          ) : (
            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
              <div className="space-y-5">
                <section className="rounded-xl border border-border">
                  <div className="border-b border-border px-4 py-3">
                    <h3 className="text-sm font-semibold text-foreground">Informations</h3>
                  </div>
                  <div className="grid gap-0 divide-y divide-border">
                    <InfoRow label="Email" value={merged.email || '—'} icon={Mail} />
                    <InfoRow label="Téléphone" value={merged.phone || '—'} icon={Phone} />
                    <InfoRow label="Rôle" value={roleLabel(merged.role)} icon={ShieldCheck} />
                    <InfoRow label="Créé le" value={formatDate(merged.created_at)} icon={UserCog} />
                  </div>
                </section>

                {detail?.deliveries_as_client && detail.deliveries_as_client.length > 0 && (
                  <section className="rounded-xl border border-border">
                    <div className="border-b border-border px-4 py-3">
                      <h3 className="text-sm font-semibold text-foreground">Commandes récentes</h3>
                    </div>
                    <div className="divide-y divide-border">
                      {detail.deliveries_as_client.map((delivery) => (
                        <div key={delivery.id} className="flex items-center justify-between gap-3 px-4 py-3">
                          <div>
                            <p className="text-sm font-semibold text-foreground">{delivery.reference}</p>
                            <p className="text-xs text-muted-foreground">{formatDate(delivery.created_at)}</p>
                          </div>
                          <span className="rounded-full bg-muted/50 px-2.5 py-1 text-xs font-semibold text-foreground">
                            {delivery.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </div>

              <aside className="space-y-4">
                {message && (
                  <div className="rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-700">
                    <div className="flex gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                      <p>{message}</p>
                    </div>
                  </div>
                )}
                {error && (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    <div className="flex gap-2">
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                      <p>{error}</p>
                    </div>
                  </div>
                )}

                <section className="rounded-xl border border-border p-4">
                  <h3 className="text-sm font-semibold text-foreground">Actions rapides</h3>
                  <div className="mt-3 grid gap-2">
                    {merged.email && (
                      <a
                        href={`mailto:${merged.email}`}
                        className="inline-flex min-h-10 items-center justify-center rounded-xl border border-border px-3 py-2 text-sm font-medium text-foreground transition hover:bg-muted/30"
                      >
                        Envoyer un email
                      </a>
                    )}
                    {merged.phone && (
                      <a
                        href={`tel:${merged.phone}`}
                        className="inline-flex min-h-10 items-center justify-center rounded-xl border border-border px-3 py-2 text-sm font-medium text-foreground transition hover:bg-muted/30"
                      >
                        Appeler
                      </a>
                    )}
                    {isDriver && onToggleDriverActive && (
                      <button
                        type="button"
                        onClick={handleToggleDriver}
                        disabled={action === 'toggle-driver'}
                        className={cn(
                          'min-h-10 rounded-xl px-3 py-2 text-sm font-semibold transition disabled:opacity-50',
                          isActive
                            ? 'bg-red-50 text-red-700 hover:bg-red-100'
                            : 'bg-green-50 text-green-700 hover:bg-green-100',
                        )}
                      >
                        {action === 'toggle-driver' ? 'Mise à jour…' : isActive ? 'Désactiver le livreur' : 'Activer le livreur'}
                      </button>
                    )}
                  </div>
                </section>

                <section className="rounded-xl border border-border p-4">
                  <h3 className="text-sm font-semibold text-foreground">Actions super-admin</h3>
                  {allowed ? (
                    <div className="mt-3 space-y-3">
                      <div className="space-y-2">
                        <label htmlFor="user-role" className="text-xs font-semibold text-muted-foreground">
                          Rôle
                        </label>
                        <div className="flex gap-2">
                          <select
                            id="user-role"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="min-h-10 flex-1 rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-primary"
                          >
                            {ROLE_OPTIONS.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                          <button
                            type="button"
                            onClick={handleRoleChange}
                            disabled={action === 'role' || role === merged.role}
                            className="rounded-xl bg-primary px-3 py-2 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:opacity-50"
                          >
                            OK
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="new-password" className="text-xs font-semibold text-muted-foreground">
                          Nouveau mot de passe
                        </label>
                        <input
                          id="new-password"
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="min-h-10 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-primary"
                          placeholder="Au moins 8 caractères"
                        />
                        <input
                          type="password"
                          value={confirm}
                          onChange={(e) => setConfirm(e.target.value)}
                          className="min-h-10 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-primary"
                          placeholder="Confirmer"
                        />
                        <button
                          type="button"
                          onClick={handlePasswordReset}
                          disabled={action === 'password'}
                          className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl border border-border px-3 py-2 text-sm font-semibold text-foreground transition hover:bg-muted/30 disabled:opacity-50"
                        >
                          <KeyRound size={15} aria-hidden="true" />
                          {action === 'password' ? 'Réinitialisation…' : 'Réinitialiser le mot de passe'}
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={handleDelete}
                        disabled={action === 'delete'}
                        className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
                      >
                        <Trash2 size={15} aria-hidden="true" />
                        {action === 'delete' ? 'Suppression…' : 'Supprimer l’utilisateur'}
                      </button>
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-muted-foreground">
                      Ces actions sont visibles uniquement pour un super administrateur.
                    </p>
                  )}
                </section>
              </aside>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function InfoRow({
  label,
  value,
  icon: Icon,
}: {
  label: string
  value: string
  icon: React.ElementType
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-muted/40 text-primary">
        <Icon size={15} aria-hidden="true" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-muted-foreground">{label}</p>
        <p className="truncate text-sm font-medium text-foreground">{value}</p>
      </div>
    </div>
  )
}

function roleLabel(role?: string): string {
  if (role === 'driver') return 'Livreur'
  if (role === 'admin') return 'Admin'
  return 'Client'
}
