'use client'

import { useEffect, useRef, useState } from 'react'
import { MoreHorizontal, KeyRound, Trash2, X } from 'lucide-react'
import { resetUserPassword, deleteUser } from '@/lib/api/admin'
import { isSuperAdmin } from '@/lib/current-user'
import { cn } from '@/lib/utils'

interface UserActionsMenuProps {
  userId: string
  userName: string
  /** Appelé après une suppression réussie (pour retirer la ligne). */
  onDeleted?: (userId: string) => void
}

type Dialog = null | 'password' | 'delete'

export default function UserActionsMenu({
  userId,
  userName,
  onDeleted,
}: UserActionsMenuProps) {
  const [allowed, setAllowed] = useState(false)
  const [open, setOpen] = useState(false)
  const [dialog, setDialog] = useState<Dialog>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  // Le flag n'est lisible qu'après montage (localStorage côté client).
  useEffect(() => {
    setAllowed(isSuperAdmin())
  }, [])

  useEffect(() => {
    if (!open) return
    function onClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [open])

  // Rien à afficher pour un admin non super : la garde backend reste la source de vérité.
  if (!allowed) return null

  return (
    <>
      <div className="relative" ref={menuRef}>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="p-1.5 rounded-lg hover:bg-muted/30 transition-colors"
          title="Plus d'actions"
          aria-haspopup="menu"
          aria-expanded={open}
        >
          <MoreHorizontal size={15} className="text-muted-foreground" />
        </button>

        {open && (
          <div
            role="menu"
            className="absolute right-0 z-20 mt-1 w-56 overflow-hidden rounded-xl border border-border bg-card shadow-lg"
          >
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false)
                setDialog('password')
              }}
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-foreground hover:bg-muted/30 transition-colors"
            >
              <KeyRound size={15} className="text-muted-foreground" />
              Réinitialiser le mot de passe
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false)
                setDialog('delete')
              }}
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <Trash2 size={15} />
              Supprimer l&apos;utilisateur
            </button>
          </div>
        )}
      </div>

      {dialog === 'password' && (
        <ResetPasswordDialog
          userId={userId}
          userName={userName}
          onClose={() => setDialog(null)}
        />
      )}

      {dialog === 'delete' && (
        <DeleteUserDialog
          userId={userId}
          userName={userName}
          onClose={() => setDialog(null)}
          onDeleted={() => {
            setDialog(null)
            onDeleted?.(userId)
          }}
        />
      )}
    </>
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
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />
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
// Réinitialisation du mot de passe
// ---------------------------------------------------------------------------

function ResetPasswordDialog({
  userId,
  userName,
  onClose,
}: {
  userId: string
  userName: string
  onClose: () => void
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
      await resetUserPassword(userId, password)
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
            Le mot de passe de <span className="font-semibold text-foreground">{userName}</span> a
            été réinitialisé. L&apos;utilisateur devra le changer à sa prochaine connexion.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary/90 transition-colors active:scale-95"
          >
            Fermer
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Définir un nouveau mot de passe pour{' '}
            <span className="font-semibold text-foreground">{userName}</span>.
          </p>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Nouveau mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              placeholder="Au moins 8 caractères"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Confirmer</label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              placeholder="Retaper le mot de passe"
            />
          </div>
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

// ---------------------------------------------------------------------------
// Suppression
// ---------------------------------------------------------------------------

function DeleteUserDialog({
  userId,
  userName,
  onClose,
  onDeleted,
}: {
  userId: string
  userName: string
  onClose: () => void
  onDeleted: () => void
}) {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleDelete() {
    setError(null)
    setSubmitting(true)
    try {
      await deleteUser(userId)
      onDeleted()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue.')
      setSubmitting(false)
    }
  }

  return (
    <DialogShell title="Supprimer l'utilisateur" onClose={onClose}>
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Voulez-vous vraiment supprimer{' '}
          <span className="font-semibold text-foreground">{userName}</span> ? Cette action est
          irréversible côté interface. L&apos;historique des livraisons est conservé.
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
            onClick={handleDelete}
            disabled={submitting}
            className={cn(
              'flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 transition-colors active:scale-95 disabled:opacity-50',
            )}
          >
            {submitting ? 'Suppression…' : 'Supprimer'}
          </button>
        </div>
      </div>
    </DialogShell>
  )
}
