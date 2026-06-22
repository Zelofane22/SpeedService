'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Package, Truck, CheckCircle, Wallet, PlusCircle, ChevronRight, Eye } from 'lucide-react'
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

export default function DashboardPage() {
  const { user } = useAuthUser()
  const [deliveries, setDeliveries] = useState<Delivery[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiGet<Delivery[]>('/deliveries')
      .then(setDeliveries)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const total     = deliveries.length
  const active    = deliveries.filter((d) => ACTIVE_STATUSES.has(d.status)).length
  const delivered = deliveries.filter((d) => d.status === 'delivered').length
  const totalSpent = deliveries
    .filter((d) => d.status !== 'cancelled')
    .reduce((sum, d) => sum + Number(d.price), 0)

  const kpiCards = [
    { label: 'Total livraisons', value: String(total),     change: `${total} au total`,    icon: Package,     iconBg: 'bg-primary/10', iconColor: 'text-primary' },
    { label: 'En cours',         value: String(active),    change: `${active} actives`,     icon: Truck,       iconBg: 'bg-amber-50',   iconColor: 'text-amber-600' },
    { label: 'Livrées',          value: String(delivered), change: `${delivered} livrées`,  icon: CheckCircle, iconBg: 'bg-green-50',   iconColor: 'text-green-600' },
    { label: 'Dépenses',         value: totalSpent > 0 ? formatPrice(totalSpent) : '0 FCFA', change: 'Total dépensé', icon: Wallet, iconBg: 'bg-blue-50', iconColor: 'text-blue-600' },
  ]

  const recent = deliveries.slice(0, 4)

  return (
    <div className="p-6 space-y-6">
      {/* Greeting */}
      <p className="text-sm text-primary-400">
        Bonjour, <span className="font-semibold text-brand-foreground">{user.name}</span> 👋
      </p>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((k) => (
          <div key={k.label} className="bg-white rounded-2xl border border-brand-border shadow-sm p-5">
            <div className="mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${k.iconBg}`}>
                <k.icon size={18} className={k.iconColor} />
              </div>
            </div>
            {loading ? (
              <div className="h-7 w-16 bg-brand-muted animate-pulse rounded-lg mb-1" />
            ) : (
              <p className="text-2xl font-bold text-brand-foreground mb-1">{k.value}</p>
            )}
            <p className="text-xs text-primary-400">{k.label}</p>
            <p className="text-xs text-primary-400 font-medium mt-1">{k.change}</p>
          </div>
        ))}
      </div>

      {/* Recent orders */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-brand-foreground">Commandes récentes</h2>
        <Link href="/history" className="text-sm text-primary font-medium hover:underline flex items-center gap-1">
          Voir tout <ChevronRight size={14} />
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-brand-border shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : recent.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <Package size={28} className="text-primary" />
            </div>
            <h3 className="text-base font-semibold text-brand-foreground mb-1">Aucune livraison pour l&apos;instant</h3>
            <p className="text-sm text-primary-400 mb-6 max-w-xs">
              Créez votre première commande et suivez-la en temps réel.
            </p>
            <Link
              href="/new-delivery"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white text-sm font-semibold rounded-2xl hover:opacity-90 transition-all shadow-lg shadow-primary/25"
            >
              <PlusCircle size={18} /> Nouvelle livraison
            </Link>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-brand-border bg-brand-muted/20">
                {['Référence', 'Date', 'Statut', 'Prix', ''].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-primary-400 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recent.map((d) => (
                <tr key={d.id} className="border-b border-brand-border last:border-0 hover:bg-brand-muted/10 transition-colors">
                  <td className="px-5 py-4 text-sm font-mono font-medium text-primary">{d.reference}</td>
                  <td className="px-5 py-4 text-sm text-primary-400">{formatDate(d.created_at)}</td>
                  <td className="px-5 py-4"><StatusBadge status={d.status} /></td>
                  <td className="px-5 py-4 text-sm font-semibold text-brand-foreground">{formatPrice(d.price)}</td>
                  <td className="px-5 py-4">
                    <button className="flex items-center gap-1 text-xs text-primary font-medium hover:underline">
                      <Eye size={12} /> Détail
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* CTA */}
      <div className="flex justify-center pt-2">
        <Link
          href="/new-delivery"
          className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white font-semibold rounded-2xl hover:opacity-90 transition-all shadow-lg shadow-primary/25"
        >
          <PlusCircle size={18} /> Nouvelle livraison
        </Link>
      </div>
    </div>
  )
}
