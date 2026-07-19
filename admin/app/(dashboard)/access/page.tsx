'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  ShieldCheck,
  ShieldOff,
  Shield,
  UserPlus,
  UserMinus,
  KeyRound,
  Lock,
  MoreHorizontal,
  X,
  History,
} from 'lucide-react'
import Card from '@/components/card'
import { EmptyState } from '@/components/empty-state'
import SearchInput from '@/components/search-input'
import {
  getAdmins,
  createAdmin,
  toggleAdminSuper,
  revokeAdmin,
  resetUserPassword,
  getAdminActivityLog,
} from '@/lib/api/admin'
import { getCurrentUser, isSuperAdmin } from '@/lib/current-user'
import type { AdminAccount, AdminActivityLog } from '@/types/admin'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString('fr-FR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Actions liées à la gestion des accès (pour filtrer le journal).
const ACCESS_ACTIONS = new Set([
  'admin.created',
  'admin.super_granted',
  'admin.super_revoked',
  'admin.revoked',
  'user.role_updated',
  'user.password_reset',
  'user.deleted',
])

const TABLE_HEADERS = ['Administrateur', 'Téléphone', 'Privilège', 'Depuis', 'Actions']

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function AccessManagementPage() {
  const [allowed, setAllowed] = useState<boolean | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  useEffect(() => {
    setAllowed(isSuperAdmin())
    setCurrentUserId(getCurrentUser()?.id ?? null)
  }, [])

  if (allowed === null) {
    return (
      <div className="p-6 space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-12 bg-muted animate-pulse rounded-xl" />
        ))}
      </div>
    )
  }

  if (!allowed) {
    return (
      <div className="p-4 sm:p-6">
        <EmptyState
          icon={Lock}
          title="Accès réservé au super administrateur"
          description="Seuls les super administrateurs peuvent gérer les privilèges et les accès des autres administrateurs."
        />
      </div>
    )
  }

  return <AccessManagement currentUserId={currentUserId} />
}

// ---------------------------------------------------------------------------
// Contenu (super admin uniquement)
// ---------------------------------------------------------------------------

type Dialog =
  | { kind: 'create' }
  | { kind: 'toggle-super'; admin: AdminAccount }
  | { kind: 'revoke'; admin: AdminAccount }
  | { kind: 'password'; admin: AdminAccount }
  | null

function AccessManagement({ currentUserId }: { currentUserId: string | null }) {
  const [admins, setAdmins] = useState<AdminAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [dialog, setDialog] = useState<Dialog>(null)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [logs, setLogs] = useState<AdminActivityLog[]>([])

  function load(searchValue: string) {
    setLoading(true)
    getAdmins({ search: searchValue })
      .then((res) => setAdmins(res.data ?? []))
      .catch((err) => console.error('Erreur chargement administrateurs', err))
      .finally(() => setLoading(false))
  }

  function loadLogs() {
    getAdminActivityLog()
      .then((res) => setLogs((res.data ?? []).filter((l) => ACCESS_ACTIONS.has(l.action)).slice(0, 8)))
      .catch(() => setLogs([]))
  }

  useEffect(() => {
    load('')
    loadLogs()
  }, [])

  function handleSearchChange(value: string) {
    setSearch(value)
    load(value)
  }

  // Recharge la liste et le journal après une action réussie.
  function refresh() {
    load(search)
    loadLogs()
  }

  const superAdminCount = useMemo(
    () => admins.filter((a) => a.is_super_admin).length,
    [admins]
  )

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Accès &amp; privilèges</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Gérez les administrateurs, leurs privilèges super administrateur et l&apos;accès au back-office.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setDialog({ kind: 'create' })}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary/90 active:scale-95"
        >
          <UserPlus size={16} aria-hidden="true" />
          Nouvel administrateur
        </button>
      </div>

      {/* Search */}
      <div className="w-full sm:w-72">
        <SearchInput
          placeholder="Rechercher un administrateur…"
          value={search}
          onChange={handleSearchChange}
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="p-6 space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-12 bg-muted animate-pulse rounded-xl" />
          ))}
        </div>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="bg-muted/20 border-b border-border">
                  {TABLE_HEADERS.map((h) => (
                    <th
                      key={h}
                      className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {admins.length === 0 ? (
                  <tr>
                    <td colSpan={TABLE_HEADERS.length} className="px-5 py-8">
                      <EmptyState
                        title="Aucun administrateur trouvé"
                        description="Créez un administrateur ou élargissez votre recherche."
                      />
                    </td>
                  </tr>
                ) : (
                  admins.map((a) => {
                    const isSelf = a.id === currentUserId
                    return (
                      <tr
                        key={a.id}
                        className="border-b border-border last:border-0 hover:bg-muted/10 transition-colors"
                      >
                        {/* Administrateur */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                                a.is_super_admin ? 'bg-primary/20' : 'bg-muted'
                              }`}
                            >
                              <Shield
                                size={14}
                                className={a.is_super_admin ? 'text-primary' : 'text-muted-foreground'}
                              />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold truncate">
                                {a.name}
                                {isSelf && (
                                  <span className="ml-2 text-[10px] font-medium text-muted-foreground">
                                    (vous)
                                  </span>
                                )}
                              </p>
                              <p className="text-xs text-muted-foreground truncate">{a.email}</p>
                            </div>
                          </div>
                        </td>
                        {/* Téléphone */}
                        <td className="px-5 py-4 text-sm text-muted-foreground">{a.phone ?? '—'}</td>
                        {/* Privilège */}
                        <td className="px-5 py-4">
                          {a.is_super_admin ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary">
                              <ShieldCheck size={12} />
                              Super admin
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-muted text-muted-foreground">
                              Admin
                            </span>
                          )}
                        </td>
                        {/* Depuis */}
                        <td className="px-5 py-4 text-xs text-muted-foreground">
                          {formatDate(a.created_at)}
                        </td>
                        {/* Actions */}
                        <td className="px-5 py-4">
                          <RowActions
                            admin={a}
                            isSelf={isSelf}
                            open={openMenuId === a.id}
                            onOpenChange={(v) => setOpenMenuId(v ? a.id : null)}
                            onAction={(kind) => {
                              setOpenMenuId(null)
                              setDialog({ kind, admin: a })
                            }}
                          />
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Journal des accès */}
      <Card className="p-5">
        <div className="mb-4 flex items-center gap-2">
          <History size={16} className="text-muted-foreground" />
          <h2 className="text-sm font-bold text-foreground">Journal des accès récents</h2>
        </div>
        {logs.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucune action d&apos;accès récente.</p>
        ) : (
          <ul className="space-y-3">
            {logs.map((log) => (
              <li key={log.id} className="flex items-start gap-3 text-sm">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                <div className="min-w-0">
                  <p className="text-foreground">{log.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {log.admin?.name ?? 'Système'} · {formatDateTime(log.created_at)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* Dialogs */}
      {dialog?.kind === 'create' && (
        <CreateAdminDialog
          onClose={() => setDialog(null)}
          onCreated={() => {
            setDialog(null)
            refresh()
          }}
        />
      )}
      {dialog?.kind === 'toggle-super' && (
        <ToggleSuperDialog
          admin={dialog.admin}
          isLastSuper={dialog.admin.is_super_admin && superAdminCount <= 1}
          onClose={() => setDialog(null)}
          onDone={() => {
            setDialog(null)
            refresh()
          }}
        />
      )}
      {dialog?.kind === 'revoke' && (
        <RevokeAdminDialog
          admin={dialog.admin}
          onClose={() => setDialog(null)}
          onDone={() => {
            setDialog(null)
            refresh()
          }}
        />
      )}
      {dialog?.kind === 'password' && (
        <ResetPasswordDialog
          admin={dialog.admin}
          onClose={() => setDialog(null)}
          onDone={() => {
            setDialog(null)
            loadLogs()
          }}
        />
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Menu d'actions par ligne
// ---------------------------------------------------------------------------

function RowActions({
  admin,
  isSelf,
  open,
  onOpenChange,
  onAction,
}: {
  admin: AdminAccount
  isSelf: boolean
  open: boolean
  onOpenChange: (open: boolean) => void
  onAction: (kind: 'toggle-super' | 'revoke' | 'password') => void
}) {
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => onOpenChange(!open)}
        className="p-1.5 rounded-lg hover:bg-muted/30 transition-colors"
        title="Actions"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <MoreHorizontal size={15} className="text-muted-foreground" />
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label="Fermer le menu"
            className="fixed inset-0 z-10 cursor-default border-0 bg-transparent"
            onClick={() => onOpenChange(false)}
          />
          <div
            role="menu"
            className="absolute right-0 z-20 mt-1 w-64 overflow-hidden rounded-xl border border-border bg-card shadow-lg"
          >
            {/* Toggle super — interdit sur soi-même */}
            <button
              type="button"
              role="menuitem"
              disabled={isSelf}
              onClick={() => onAction('toggle-super')}
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-foreground hover:bg-muted/30 transition-colors disabled:opacity-40 disabled:hover:bg-transparent"
            >
              {admin.is_super_admin ? (
                <>
                  <ShieldOff size={15} className="text-muted-foreground" />
                  Retirer le privilège super admin
                </>
              ) : (
                <>
                  <ShieldCheck size={15} className="text-primary" />
                  Promouvoir super admin
                </>
              )}
            </button>

            <button
              type="button"
              role="menuitem"
              onClick={() => onAction('password')}
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-foreground hover:bg-muted/30 transition-colors"
            >
              <KeyRound size={15} className="text-muted-foreground" />
              Réinitialiser le mot de passe
            </button>

            {/* Révoquer — interdit sur soi-même et sur un super admin */}
            <button
              type="button"
              role="menuitem"
              disabled={isSelf || admin.is_super_admin}
              onClick={() => onAction('revoke')}
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 transition-colors disabled:opacity-40 disabled:hover:bg-transparent"
              title={
                admin.is_super_admin
                  ? "Retirez d'abord le privilège super admin"
                  : undefined
              }
            >
              <UserMinus size={15} />
              Révoquer l&apos;accès admin
            </button>
          </div>
        </>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Overlay générique
// ---------------------------------------------------------------------------

function DialogShell({
  title,
  onClose,
  children,
}: {
  title: string
  onClose: () => void
  children: React.ReactNode
}) {
  useEffect(() => {
    function onEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onEsc)
    return () => document.removeEventListener('keydown', onEsc)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden="true" />
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl">
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 className="text-lg font-bold text-foreground">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-muted/30 transition-colors"
            aria-label="Fermer"
          >
            <X size={18} className="text-muted-foreground" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Création d'un administrateur
// ---------------------------------------------------------------------------

function CreateAdminDialog({
  onClose,
  onCreated,
}: {
  onClose: () => void
  onCreated: () => void
}) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [isSuper, setIsSuper] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (name.trim().length === 0) {
      setError('Le nom est requis.')
      return
    }
    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.')
      return
    }
    setSubmitting(true)
    try {
      await createAdmin({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        password,
        is_super_admin: isSuper,
      })
      onCreated()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <DialogShell title="Nouvel administrateur" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Le nouvel administrateur devra changer son mot de passe à sa première connexion.
        </p>
        <Field label="Nom complet">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            placeholder="Prénom Nom"
          />
        </Field>
        <Field label="Email">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            placeholder="admin@speedservice.bj"
          />
        </Field>
        <Field label="Téléphone (optionnel)">
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            placeholder="+229…"
          />
        </Field>
        <Field label="Mot de passe initial">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            placeholder="Au moins 8 caractères"
          />
        </Field>
        <label className="flex items-center gap-2.5 rounded-xl border border-border bg-muted/10 px-3 py-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={isSuper}
            onChange={(e) => setIsSuper(e.target.checked)}
            className="h-4 w-4 rounded border-border text-primary focus:ring-primary/30"
          />
          <span className="flex items-center gap-1.5 text-sm font-medium text-foreground">
            <ShieldCheck size={14} className="text-primary" />
            Accorder le privilège super administrateur
          </span>
        </label>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted/20 transition-colors"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary/90 transition-colors active:scale-95 disabled:opacity-50"
          >
            {submitting ? 'Création…' : 'Créer'}
          </button>
        </div>
      </form>
    </DialogShell>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-foreground">{label}</label>
      {children}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Promotion / rétrogradation super admin
// ---------------------------------------------------------------------------

function ToggleSuperDialog({
  admin,
  isLastSuper,
  onClose,
  onDone,
}: {
  admin: AdminAccount
  isLastSuper: boolean
  onClose: () => void
  onDone: () => void
}) {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const granting = !admin.is_super_admin

  async function handleConfirm() {
    setError(null)
    setSubmitting(true)
    try {
      await toggleAdminSuper(admin.id)
      onDone()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue.')
      setSubmitting(false)
    }
  }

  return (
    <DialogShell
      title={granting ? 'Promouvoir super administrateur' : 'Retirer le privilège super admin'}
      onClose={onClose}
    >
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          {granting ? (
            <>
              <span className="font-semibold text-foreground">{admin.name}</span> pourra effectuer
              toutes les actions critiques (gestion des admins, révocations, réinitialisations de
              mots de passe).
            </>
          ) : (
            <>
              <span className="font-semibold text-foreground">{admin.name}</span> perdra l&apos;accès
              aux actions critiques mais restera administrateur.
            </>
          )}
        </p>
        {isLastSuper && (
          <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
            Impossible : il s&apos;agit du dernier super administrateur.
          </p>
        )}
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted/20 transition-colors"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={submitting || isLastSuper}
            className="flex-1 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary/90 transition-colors active:scale-95 disabled:opacity-50"
          >
            {submitting ? 'Enregistrement…' : granting ? 'Promouvoir' : 'Retirer'}
          </button>
        </div>
      </div>
    </DialogShell>
  )
}

// ---------------------------------------------------------------------------
// Révocation d'accès
// ---------------------------------------------------------------------------

function RevokeAdminDialog({
  admin,
  onClose,
  onDone,
}: {
  admin: AdminAccount
  onClose: () => void
  onDone: () => void
}) {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleConfirm() {
    setError(null)
    setSubmitting(true)
    try {
      await revokeAdmin(admin.id)
      onDone()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue.')
      setSubmitting(false)
    }
  }

  return (
    <DialogShell title="Révoquer l'accès administrateur" onClose={onClose}>
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{admin.name}</span> sera rétrogradé au rôle
          client et ses sessions seront invalidées. Le compte et son historique sont conservés.
        </p>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted/20 transition-colors"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={submitting}
            className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 transition-colors active:scale-95 disabled:opacity-50"
          >
            {submitting ? 'Révocation…' : "Révoquer l'accès"}
          </button>
        </div>
      </div>
    </DialogShell>
  )
}

// ---------------------------------------------------------------------------
// Réinitialisation du mot de passe
// ---------------------------------------------------------------------------

function ResetPasswordDialog({
  admin,
  onClose,
  onDone,
}: {
  admin: AdminAccount
  onClose: () => void
  onDone: () => void
}) {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.')
      return
    }
    if (password !== confirm) {
      setError('Les deux mots de passe ne correspondent pas.')
      return
    }
    setSubmitting(true)
    try {
      await resetUserPassword(admin.id, password)
      setDone(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <DialogShell title="Réinitialiser le mot de passe" onClose={onClose}>
      {done ? (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Le mot de passe de{' '}
            <span className="font-semibold text-foreground">{admin.name}</span> a été réinitialisé.
            L&apos;administrateur devra le changer à sa prochaine connexion.
          </p>
          <button
            type="button"
            onClick={onDone}
            className="w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary/90 transition-colors active:scale-95"
          >
            Fermer
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Définir un nouveau mot de passe pour{' '}
            <span className="font-semibold text-foreground">{admin.name}</span>.
          </p>
          <Field label="Nouveau mot de passe">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              placeholder="Au moins 8 caractères"
            />
          </Field>
          <Field label="Confirmer">
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              placeholder="Retaper le mot de passe"
            />
          </Field>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted/20 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary/90 transition-colors active:scale-95 disabled:opacity-50"
            >
              {submitting ? 'Enregistrement…' : 'Réinitialiser'}
            </button>
          </div>
        </form>
      )}
    </DialogShell>
  )
}
