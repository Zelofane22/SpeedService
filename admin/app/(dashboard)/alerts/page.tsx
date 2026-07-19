'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AlertTriangle, AlertCircle, Info, RefreshCw, ChevronRight, BellOff } from 'lucide-react'
import Card from '@/components/card'
import { getAdminAlerts } from '@/lib/api/admin'
import type { AdminAlert } from '@/types/admin'

// ---------------------------------------------------------------------------
// Severity config
// ---------------------------------------------------------------------------

const SEVERITY_CONFIG: Record<
  AdminAlert['severity'],
  { label: string; icon: React.ElementType; border: string; iconColor: string; chipBg: string }
> = {
  error: {
    label: 'Critique',
    icon: AlertCircle,
    border: 'border-l-red-500',
    iconColor: 'text-red-500',
    chipBg: 'bg-red-50 dark:bg-red-900/30 text-red-600',
  },
  warning: {
    label: 'À traiter',
    icon: AlertTriangle,
    border: 'border-l-amber-500',
    iconColor: 'text-amber-500',
    chipBg: 'bg-amber-50 dark:bg-amber-900/30 text-amber-600',
  },
  info: {
    label: 'Information',
    icon: Info,
    border: 'border-l-blue-500',
    iconColor: 'text-blue-500',
    chipBg: 'bg-blue-50 dark:bg-blue-900/30 text-blue-600',
  },
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<AdminAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  function load(silent = false) {
    if (!silent) setLoading(true)
    else setRefreshing(true)
    getAdminAlerts()
      .then((res) => setAlerts(res.alerts ?? []))
      .catch((err) => console.error('Erreur chargement alertes', err))
      .finally(() => {
        setLoading(false)
        setRefreshing(false)
      })
  }

  useEffect(() => {
    load()
  }, [])

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Alertes backoffice</h1>
          <p className="text-sm text-muted-foreground">
            Erreurs, blocages et validations nécessitant une action, détectés automatiquement.
          </p>
        </div>
        <button
          onClick={() => load(true)}
          disabled={refreshing}
          className="p-2 rounded-xl border border-border hover:bg-muted/30 transition-colors disabled:opacity-50 shrink-0"
          title="Rafraîchir"
        >
          <RefreshCw size={18} className={`text-muted-foreground ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Loading skeleton */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-muted animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : alerts.length === 0 ? (
        <Card className="p-10 flex flex-col items-center justify-center text-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-green-50 dark:bg-green-900/30 flex items-center justify-center">
            <BellOff size={20} className="text-green-600" />
          </div>
          <p className="text-sm font-semibold text-foreground">Aucune alerte en cours</p>
          <p className="text-xs text-muted-foreground">
            Tout est sous contrôle — aucune action n&apos;est requise pour le moment.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => {
            const cfg = SEVERITY_CONFIG[alert.severity] ?? SEVERITY_CONFIG.info
            const Icon = cfg.icon
            return (
              <Card key={alert.id} className={`p-5 border-l-4 ${cfg.border}`}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <Icon size={18} className={`${cfg.iconColor} shrink-0 mt-0.5`} />
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-sm font-semibold text-foreground">{alert.title}</h2>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${cfg.chipBg}`}>
                          {cfg.label}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-muted/40 text-muted-foreground">
                          {alert.kind}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{alert.message}</p>
                    </div>
                  </div>
                  <Link
                    href={alert.action}
                    className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline shrink-0 mt-0.5"
                  >
                    Ouvrir <ChevronRight size={14} />
                  </Link>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
