'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  History,
  KeyRound,
  LockKeyhole,
  ShieldCheck,
  UserCog,
  UsersRound,
} from 'lucide-react'
import Card from '@/components/card'

interface StoredUser {
  id?: string
  name?: string
  email?: string
  role?: string
  is_super_admin?: boolean
}

const ROLE_ACCESS = [
  {
    title: 'Administrateur',
    description: 'Supervision opérationnelle, validations, rapports et journal.',
    permissions: ['Lecture back-office', 'Validation paiements', 'Suivi commandes', 'Exports CSV'],
  },
  {
    title: 'Super administrateur',
    description: 'Administration sensible des comptes et changement de rôles.',
    permissions: [
      'Réinitialisation mot de passe',
      'Suppression utilisateur',
      'Changement de rôle',
      'Accès aux actions sensibles',
    ],
  },
]

const PRIVILEGE_ROWS = [
  ['Lecture dashboard', true, true],
  ['Validation paiements', true, true],
  ['Gestion commandes', true, true],
  ['Gestion Livreurs et clients', true, true],
  ['Changer le rôle d’un compte', false, true],
  ['Réinitialiser un mot de passe', false, true],
  ['Supprimer un utilisateur', false, true],
] as const

const QUICK_ACTIONS = [
  { href: '/clients', label: 'Gérer les clients', icon: UsersRound },
  { href: '/drivers', label: 'Gérer les Livreurs', icon: UserCog },
  { href: '/activity', label: 'Consulter le journal', icon: History },
]

export default function AccessPrivilegesPage() {
  const [user, setUser] = useState<StoredUser>({})

  useEffect(() => {
    try {
      const stored = localStorage.getItem('user')
      if (stored) setUser(JSON.parse(stored) as StoredUser)
    } catch {
      setUser({})
    }
  }, [])

  const isOwner = user.is_super_admin === true
  const accessLabel = isOwner ? 'Super administrateur' : 'Administrateur'
  const accessDescription = isOwner
    ? 'Vous pouvez exécuter les actions sensibles sur les comptes.'
    : 'Les actions sensibles restent réservées à un super administrateur.'

  return (
    <div className="p-4 sm:p-6 space-y-5 sm:space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground">Accès & privilèges</h1>
        <p className="text-sm text-muted-foreground">
          Contrôlez les niveaux d&apos;administration et les actions sensibles du back-office.
        </p>
      </div>

      <Card className="overflow-hidden">
        <section aria-labelledby="access-privileges-title">
          <div className="flex flex-col gap-4 border-b border-border px-5 py-5 sm:px-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <ShieldCheck size={20} aria-hidden="true" />
              </div>
              <div>
                <h2 id="access-privileges-title" className="text-base font-semibold text-foreground">
                  Espace Accès & privilèges
                </h2>
                <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                  Comparez les droits disponibles et vérifiez le niveau de l&apos;administrateur connecté.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-border bg-muted/30 px-3 py-2 text-sm">
              {isOwner ? (
                <CheckCircle2 className="h-4 w-4 text-green-600" aria-hidden="true" />
              ) : (
                <LockKeyhole className="h-4 w-4 text-amber-600" aria-hidden="true" />
              )}
              <span className="font-semibold text-foreground">{accessLabel}</span>
            </div>
          </div>

          <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="space-y-5 px-5 py-5 sm:px-6">
              <div className="grid gap-4 md:grid-cols-2">
                {ROLE_ACCESS.map((role) => (
                  <div key={role.title} className="rounded-xl border border-border bg-muted/20 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-semibold text-foreground">{role.title}</h3>
                        <p className="mt-1 text-sm text-muted-foreground">{role.description}</p>
                      </div>
                      {role.title === accessLabel && (
                        <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                          Actuel
                        </span>
                      )}
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {role.permissions.map((permission) => (
                        <span
                          key={permission}
                          className="rounded-full border border-border bg-card px-2.5 py-1 text-xs font-medium text-muted-foreground"
                        >
                          {permission}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="overflow-hidden rounded-xl border border-border">
                <div className="grid grid-cols-[minmax(0,1fr)_88px_88px] bg-muted/30 px-4 py-3 text-xs font-semibold text-muted-foreground sm:grid-cols-[minmax(0,1fr)_140px_160px]">
                  <span>Privilège</span>
                  <span className="text-center">Admin</span>
                  <span className="text-center">Super admin</span>
                </div>
                <div className="divide-y divide-border">
                  {PRIVILEGE_ROWS.map(([label, adminAllowed, superAdminAllowed]) => (
                    <div
                      key={label}
                      className="grid grid-cols-[minmax(0,1fr)_88px_88px] items-center px-4 py-3 text-sm sm:grid-cols-[minmax(0,1fr)_140px_160px]"
                    >
                      <span className="pr-3 text-foreground">{label}</span>
                      <PrivilegeMark allowed={adminAllowed} label={`Admin : ${label}`} />
                      <PrivilegeMark allowed={superAdminAllowed} label={`Super admin : ${label}`} />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <aside className="border-t border-border bg-muted/20 px-5 py-5 lg:border-l lg:border-t-0">
              <div className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center gap-2">
                  <KeyRound className="h-4 w-4 text-primary" aria-hidden="true" />
                  <h3 className="text-sm font-semibold text-foreground">Votre accès</h3>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{accessDescription}</p>
              </div>

              {!isOwner && (
                <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                    <p>
                      Demandez à un super administrateur de modifier les rôles ou de supprimer un compte.
                    </p>
                  </div>
                </div>
              )}

              <div className="mt-5 space-y-2">
                {QUICK_ACTIONS.map((action) => {
                  const Icon = action.icon
                  return (
                    <Link
                      key={action.href}
                      href={action.href}
                      className="flex min-h-11 items-center justify-between gap-3 rounded-xl border border-border bg-card px-3 py-2 text-sm font-medium text-foreground transition hover:bg-muted/40"
                    >
                      <span className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-primary" aria-hidden="true" />
                        {action.label}
                      </span>
                      <ExternalLink className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    </Link>
                  )
                })}
              </div>
            </aside>
          </div>
        </section>
      </Card>
    </div>
  )
}

function PrivilegeMark({ allowed, label }: { allowed: boolean; label: string }) {
  return (
    <span className="flex justify-center">
      <span
        aria-label={allowed ? `${label} autorisé` : `${label} non autorisé`}
        className={
          allowed
            ? 'inline-flex h-7 w-7 items-center justify-center rounded-full bg-green-100 text-green-700'
            : 'inline-flex h-7 w-7 items-center justify-center rounded-full bg-muted text-muted-foreground'
        }
      >
        {allowed ? (
          <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
        ) : (
          <LockKeyhole className="h-4 w-4" aria-hidden="true" />
        )}
      </span>
    </span>
  )
}
