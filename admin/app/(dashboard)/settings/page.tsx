'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Bell,
  CreditCard,
  MapPinned,
  Palette,
  ShieldCheck,
  UserCircle,
} from 'lucide-react'
import Card from '@/components/card'
import { ThemeToggle } from '@/components/theme-toggle'

interface StoredUser {
  name?: string
  email?: string
  is_super_admin?: boolean
}

const SETTINGS_GROUPS = [
  {
    title: 'Accès & privilèges',
    icon: ShieldCheck,
    items: [
      ['Niveaux admin', 'Voir dans le menu dédié'],
      ['Actions sensibles', 'Réservées au super admin'],
      ['Journalisation', 'Suivie dans Journal'],
    ],
  },
  {
    title: 'Notifications',
    icon: Bell,
    items: [
      ['Paiements à valider', 'Actif via le centre d’alertes'],
      ['Candidatures livreurs', 'Actif via le back-office'],
      ['Email opérationnel', 'À connecter au service mail'],
    ],
  },
  {
    title: 'Zones & tarifs',
    icon: MapPinned,
    items: [
      ['Zones de livraison', 'Cotonou et environs'],
      ['Tarifs colis', 'À administrer côté API'],
      ['Créneaux de service', 'À connecter au backend'],
    ],
  },
  {
    title: 'Paiements',
    icon: CreditCard,
    items: [
      ['MTN MoMo / MoovMoney', 'Suivi depuis Paiements'],
      ['Paiement à la livraison', 'Validation manuelle active'],
      ['Paiement en agence', 'Validation manuelle active'],
    ],
  },
]

export default function SettingsPage() {
  const [user, setUser] = useState<StoredUser>({})

  useEffect(() => {
    try {
      const stored = localStorage.getItem('user')
      if (stored) setUser(JSON.parse(stored) as StoredUser)
    } catch {
      setUser({})
    }
  }, [])

  const accessLabel = user.is_super_admin === true ? 'Super administrateur' : 'Administrateur'

  return (
    <div className="p-4 sm:p-6 space-y-5 sm:space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground">Paramètres</h1>
        <p className="text-sm text-muted-foreground">
          Configuration de l&apos;espace administrateur SpeedService.
        </p>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-5">
          <Card className="p-5 sm:p-6">
            <section className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <UserCircle size={20} aria-hidden="true" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-foreground">
                    Profil admin
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {user.email || 'admin@speedservice.bj'}
                  </p>
                </div>
              </div>
              <div className="rounded-xl border border-border px-4 py-3 text-sm">
                <p className="font-semibold text-foreground">
                  {user.name || 'Administrateur'}
                </p>
                <p className="text-xs text-muted-foreground">{accessLabel}</p>
              </div>
            </section>
          </Card>

          <Card className="p-5 sm:p-6">
            <section className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Palette size={20} aria-hidden="true" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-foreground">
                    Apparence
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Préférence conservée dans le navigateur.
                  </p>
                </div>
              </div>

              <div className="w-full sm:w-72">
                <ThemeToggle />
              </div>
            </section>
          </Card>

          <div className="grid gap-5 lg:grid-cols-2">
            {SETTINGS_GROUPS.map((group) => {
              const Icon = group.icon
              const isAccessGroup = group.title === 'Accès & privilèges'

              return (
                <Card key={group.title} className="overflow-hidden">
                  <div className="flex items-center gap-3 border-b border-border px-5 py-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted/40 text-primary">
                      <Icon size={18} aria-hidden="true" />
                    </div>
                    <h2 className="text-base font-semibold text-foreground">
                      {group.title}
                    </h2>
                  </div>
                  <div className="divide-y divide-border">
                    {group.items.map(([label, value]) => (
                      <div
                        key={label}
                        className="flex items-center justify-between gap-4 px-5 py-3.5"
                      >
                        <span className="text-sm text-foreground">{label}</span>
                        <span className="text-right text-xs font-medium text-muted-foreground">
                          {value}
                        </span>
                      </div>
                    ))}
                  </div>
                  {isAccessGroup && (
                    <div className="border-t border-border px-5 py-4">
                      <Link
                        href="/access-privileges"
                        className="inline-flex min-h-11 items-center rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary/90"
                      >
                        Ouvrir l&apos;espace
                      </Link>
                    </div>
                  )}
                </Card>
              )
            })}
          </div>
        </div>

        <Card className="h-fit p-5">
          <h2 className="text-base font-semibold text-foreground">État de configuration</h2>
          <div className="mt-4 space-y-3">
            {[
              ['Thème', 'Configuré'],
              ['Alertes admin', 'Configuré'],
              ['Exports CSV', 'Configuré'],
              ['Accès & privilèges', accessLabel],
              ['Tarifs dynamiques', 'À connecter'],
            ].map(([label, status]) => (
              <div key={label} className="flex items-center justify-between gap-3">
                <span className="text-sm text-muted-foreground">{label}</span>
                <span className="rounded-full bg-muted/50 px-2.5 py-1 text-xs font-semibold text-foreground">
                  {status}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
