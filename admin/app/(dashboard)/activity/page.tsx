'use client'

import { useCallback, useEffect, useState } from 'react'
import { History, ChevronLeft, ChevronRight, User } from 'lucide-react'
import Card from '@/components/card'
import { getAdminActivityLog } from '@/lib/api/admin'
import type { AdminActivityLog } from '@/types/admin'

// ---------------------------------------------------------------------------
// Action config
// ---------------------------------------------------------------------------

const ACTION_CONFIG: Record<string, { label: string; chip: string }> = {
  'user.role_updated':            { label: 'Rôle modifié',       chip: 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600' },
  'delivery.status_updated':      { label: 'Statut forcé',       chip: 'bg-purple-50 dark:bg-purple-900/30 text-purple-600' },
  'payment.validated':            { label: 'Paiement validé',    chip: 'bg-green-50 dark:bg-green-900/30 text-green-600' },
  'driver.status_toggled':        { label: 'Livreur activé/désactivé', chip: 'bg-amber-50 dark:bg-amber-900/30 text-amber-600' },
  'driver_application.reviewed':  { label: 'Candidature traitée', chip: 'bg-blue-50 dark:bg-blue-900/30 text-blue-600' },
}

const TABLE_HEADERS = ['Date', 'Administrateur', 'Action', 'Détail']

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function ActivityPage() {
  const [logs, setLogs] = useState<AdminActivityLog[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [lastPage, setLastPage] = useState(1)
  const [total, setTotal] = useState(0)

  const load = useCallback((pageNumber: number) => {
    setLoading(true)
    getAdminActivityLog({ page: pageNumber })
      .then((res) => {
        setLogs(res.data ?? [])
        setPage(res.current_page ?? pageNumber)
        setLastPage(res.last_page ?? 1)
        setTotal(res.total ?? 0)
      })
      .catch((err) => console.error('Erreur chargement journal', err))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    load(1)
  }, [load])

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Journal d&apos;activité</h1>
        <p className="text-sm text-muted-foreground">
          Historique des actions effectuées par les administrateurs — lecture seule.
        </p>
      </div>

      {loading ? (
        <div className="p-6 space-y-4">
          {[...Array(5)].map((_, i) => (
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
                {logs.length === 0 ? (
                  <tr>
                    <td
                      colSpan={TABLE_HEADERS.length}
                      className="px-5 py-10 text-center text-muted-foreground text-sm"
                    >
                      <History size={20} className="mx-auto mb-2 opacity-50" />
                      Aucune action enregistrée pour le moment
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => {
                    const cfg = ACTION_CONFIG[log.action] ?? {
                      label: log.action,
                      chip: 'bg-muted/40 text-muted-foreground',
                    }
                    return (
                      <tr
                        key={log.id}
                        className="border-b border-border last:border-0 hover:bg-muted/10 transition-colors"
                      >
                        <td className="px-5 py-4 text-xs text-muted-foreground whitespace-nowrap">
                          {formatDateTime(log.created_at)}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                              <User size={12} className="text-primary" />
                            </div>
                            <span className="text-sm font-medium">{log.admin?.name ?? '—'}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${cfg.chip}`}>
                            {cfg.label}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-sm text-muted-foreground">{log.description}</td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {lastPage > 1 && (
            <div className="px-5 py-3.5 flex items-center justify-between border-t border-border">
              <p className="text-xs text-muted-foreground">
                Page {page} sur {lastPage} — {total} action{total > 1 ? 's' : ''}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => load(page - 1)}
                  disabled={page <= 1}
                  className="p-1.5 rounded-lg border border-border hover:bg-muted/30 transition-colors disabled:opacity-40"
                  title="Page précédente"
                >
                  <ChevronLeft size={15} className="text-muted-foreground" />
                </button>
                <button
                  onClick={() => load(page + 1)}
                  disabled={page >= lastPage}
                  className="p-1.5 rounded-lg border border-border hover:bg-muted/30 transition-colors disabled:opacity-40"
                  title="Page suivante"
                >
                  <ChevronRight size={15} className="text-muted-foreground" />
                </button>
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  )
}
