'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { Package, Truck, CheckCircle, PlusCircle, ChevronRight, Eye } from 'lucide-react'
import { useAuthUser } from '@/lib/auth-context'
import { StatusBadge } from '@/components/status-badge'
import { apiGet } from '@/lib/api'

type Delivery = {
  id: string
  reference: string
  status: string
  pickup_address: string
  delivery_address: string
  price: string
  created_at: string
}

const ACTIVE_STATUSES = new Set(['awaiting_payment', 'awaiting_validation', 'confirmed', 'assigned', 'picking_up', 'in_delivery'])

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
}

function formatPrice(raw: string | number) {
  return Number(raw).toLocaleString('fr-FR') + ' FCFA'
}

function shortAddress(addr: string) {
  const parts = addr.split(',')
  return parts[0]?.trim() ?? addr
}

function fetchDeliveries() {
  return apiGet<Delivery[]>('/deliveries')
}

export default function DashboardPage() {
  const { user } = useAuthUser()
  const [deliveries, setDeliveries] = useState<Delivery[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)

  const loadDeliveries = useCallback(async () => {
    setLoading(true)
    setLoadError(false)

    try {
      setDeliveries(await fetchDeliveries())
    } catch {
      setLoadError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let ignore = false

    async function loadInitialDeliveries() {
      try {
        const initialDeliveries = await fetchDeliveries()

        if (!ignore) {
          setDeliveries(initialDeliveries)
          setLoadError(false)
        }
      } catch {
        if (!ignore) {
          setLoadError(true)
        }
      } finally {
        if (!ignore) {
          setLoading(false)
        }
      }
    }

    void loadInitialDeliveries()

    return () => {
      ignore = true
    }
  }, [])

  const total     = deliveries.length
  const active    = deliveries.filter((d) => ACTIVE_STATUSES.has(d.status)).length
  const delivered = deliveries.filter((d) => d.status === 'delivered').length

  const kpiCards = [
    { label: 'Total livraisons', value: String(total),     change: `${total} au total`,    icon: Package,     iconBg: 'bg-primary/10', iconColor: 'text-primary' },
    { label: 'En cours',         value: String(active),    change: `${active} actives`,     icon: Truck,       iconBg: 'bg-amber-50',   iconColor: 'text-amber-600' },
    { label: 'Livrées',          value: String(delivered), change: `${delivered} livrées`,  icon: CheckCircle, iconBg: 'bg-green-50',   iconColor: 'text-green-600' },
  ]

  const recent = deliveries.slice(0, 4)

  return (
    <div className="p-4 sm:p-6 space-y-5 sm:space-y-6">
      {/* Greeting */}
      <p className="text-sm text-gray-700">
        Bonjour, <span className="font-semibold text-brand-foreground">{user.name}</span> 👋
      </p>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
        {kpiCards.map((k) => (
          <div key={k.label} className="bg-white rounded-2xl border border-brand-border shadow-sm p-4 sm:p-5">
            <div className="mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${k.iconBg}`}>
                <k.icon size={18} className={k.iconColor} />
              </div>
            </div>
            {loading ? (
              <div className="h-7 w-16 bg-brand-muted animate-pulse rounded-lg mb-1" />
            ) : (
              <p className="text-xl font-bold text-brand-foreground mb-1 wrap-break-word sm:text-2xl">{k.value}</p>
            )}
            <p className="text-xs text-gray-700">{k.label}</p>
            <p className="text-xs text-gray-700 font-medium mt-1">{k.change}</p>
          </div>
        ))}
      </div>

      {/* Recent orders */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-brand-foreground sm:text-lg">Commandes récentes</h2>
        <Link href="/history" className="text-sm text-primary font-medium hover:underline flex items-center gap-1">
          Voir tout <ChevronRight size={14} />
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-brand-border shadow-sm overflow-hidden" aria-busy={loading}>
        {loading ? (
          <div className="flex items-center justify-center py-16" role="status">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" aria-hidden="true" />
            <span className="sr-only">Chargement des livraisons…</span>
          </div>
        ) : loadError ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
              <Package size={28} className="text-red-600" aria-hidden="true" />
            </div>
            <h3 className="text-base font-semibold text-brand-foreground mb-1">Vos livraisons sont indisponibles</h3>
            <p className="max-w-sm text-sm text-gray-700 mb-6">
              Vérifiez votre connexion, puis réessayez. Vos commandes ne sont pas perdues.
            </p>
            <button
              type="button"
              onClick={() => void loadDeliveries()}
              className="min-h-11 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              Réessayer
            </button>
          </div>
        ) : recent.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <Package size={28} className="text-primary" />
            </div>
            <h3 className="text-base font-semibold text-brand-foreground mb-1">Aucune livraison pour l&apos;instant</h3>
            <p className="text-sm text-gray-700 mb-6 max-w-xs">
              Créez votre première commande et suivez son avancement à chaque étape.
            </p>
            <Link
              href="/new-delivery"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white text-sm font-semibold rounded-2xl hover:opacity-90 transition-all shadow-lg shadow-primary/25"
            >
              <PlusCircle size={18} /> Nouvelle livraison
            </Link>
          </div>
        ) : (
          <>
            <div className="divide-y divide-brand-border md:hidden">
              {recent.map((d) => (
                <RecentDeliveryCard key={d.id} delivery={d} />
              ))}
            </div>

            <table className="hidden w-full md:table">
            <thead>
              <tr className="border-b border-brand-border bg-brand-muted/20">
                {['Référence', 'Date', 'Statut', 'Prix', ''].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recent.map((d) => (
                <tr key={d.id} className="border-b border-brand-border last:border-0 hover:bg-brand-muted/10 transition-colors">
                  <td className="px-5 py-4 text-sm font-mono font-medium text-primary">{d.reference}</td>
                  <td className="px-5 py-4 text-sm text-gray-700">{formatDate(d.created_at)}</td>
                  <td className="px-5 py-4"><StatusBadge status={d.status} /></td>
                  <td className="px-5 py-4 text-sm font-semibold text-brand-foreground">{formatPrice(d.price)}</td>
                  <td className="px-5 py-4">
                    <Link href={`/deliveries/${d.id}`} className="flex items-center gap-1 text-xs text-primary font-medium hover:underline">
                      <Eye size={12} /> Détail
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
            </table>
          </>
        )}
      </div>

      {/* CTA */}
      <div className="flex justify-center pt-2">
        <Link
          href="/new-delivery"
          className="inline-flex w-full items-center justify-center gap-2 px-8 py-4 bg-primary text-white font-semibold rounded-2xl hover:opacity-90 transition-all shadow-lg shadow-primary/25 sm:w-auto"
        >
          <PlusCircle size={18} /> Nouvelle livraison
        </Link>
      </div>
    </div>
  )
}

function RecentDeliveryCard({ delivery }: { delivery: Delivery }) {
  return (
    <Link href={`/deliveries/${delivery.id}`} className="block p-4 transition-colors hover:bg-brand-muted/10">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-mono text-sm font-bold text-primary">{delivery.reference}</p>
          <p className="mt-1 text-xs text-gray-700">{formatDate(delivery.created_at)}</p>
        </div>
        <StatusBadge status={delivery.status} />
      </div>
      <div className="mt-3 space-y-1 text-sm">
        <p className="truncate text-gray-700">De {shortAddress(delivery.pickup_address)}</p>
        <p className="truncate text-brand-foreground">Vers {shortAddress(delivery.delivery_address)}</p>
      </div>
      <div className="mt-3 flex items-center justify-between gap-3">
        <p className="text-sm font-bold text-brand-foreground">{formatPrice(delivery.price)}</p>
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary">
          <Eye size={12} /> Détail
        </span>
      </div>
    </Link>
  )
}
