'use client'

import { useEffect, useState } from 'react'
import { Package, CheckCircle, XCircle, Clock } from 'lucide-react'
import { apiGet } from '@/lib/api'
import { cn } from '@/lib/utils'

type Mission = {
  id: string
  reference: string
  status: string
  pickup_address: string
  delivery_address: string
  price: string
  distance: string | null
  package_type: string
  delivery_type: 'standard' | 'express'
  client: { id: string; name: string; phone: string }
  created_at: string
}

const STATUS_INFO: Record<string, { label: string; icon: typeof CheckCircle; color: string }> = {
  delivered:  { label: 'Livrée',    icon: CheckCircle, color: 'text-green-600' },
  cancelled:  { label: 'Annulée',   icon: XCircle,     color: 'text-red-500' },
  in_delivery:{ label: 'En transit',icon: Clock,       color: 'text-blue-600' },
  picking_up: { label: 'Récupération', icon: Clock,    color: 'text-amber-600' },
  assigned:   { label: 'Affectée',  icon: Clock,       color: 'text-primary' },
}

const DONE_STATUSES = new Set(['delivered', 'cancelled'])

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
}

function fmtPrice(v: string | number) {
  return Number(v).toLocaleString('fr-FR') + ' FCFA'
}

function shortAddr(addr: string) {
  return addr.split(',')[0]?.trim() ?? addr
}

export default function DriverHistoryPage() {
  const [missions, setMissions] = useState<Mission[]>([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState<string | null>(null)

  useEffect(() => {
    apiGet<Mission[]>('/driver/missions')
      .then((ms) => setMissions(ms.filter((m) => DONE_STATUSES.has(m.status))))
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="p-6 space-y-5">
      {error && (
        <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-2xl text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : missions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
            <Package size={32} className="text-primary" />
          </div>
          <h3 className="text-base font-semibold text-brand-foreground mb-1">Aucune mission terminée</h3>
          <p className="text-sm text-gray-700">Vos missions complétées apparaîtront ici.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-brand-border shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-brand-border bg-brand-muted/20">
                {['Référence', 'Date', 'Trajet', 'Statut', 'Prix'].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {missions.map((m) => {
                const info = STATUS_INFO[m.status]
                const Icon = info?.icon ?? Clock
                return (
                  <tr key={m.id} className="border-b border-brand-border last:border-0 hover:bg-brand-muted/10 transition-colors">
                    <td className="px-5 py-4 text-sm font-mono font-medium text-primary">{m.reference}</td>
                    <td className="px-5 py-4 text-sm text-gray-700">{fmtDate(m.created_at)}</td>
                    <td className="px-5 py-4 text-sm text-brand-foreground">
                      {shortAddr(m.pickup_address)} → {shortAddr(m.delivery_address)}
                    </td>
                    <td className="px-5 py-4">
                      <span className={cn('flex items-center gap-1.5 text-xs font-semibold', info?.color ?? 'text-gray-700')}>
                        <Icon size={13} /> {info?.label ?? m.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm font-semibold text-brand-foreground">{fmtPrice(m.price)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
