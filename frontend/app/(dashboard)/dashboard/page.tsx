'use client'

import Link from 'next/link'
import { Package, Truck, CheckCircle, Wallet, PlusCircle, ChevronRight, Eye } from 'lucide-react'
import { useAuthUser } from '@/lib/auth-context'
import { StatusBadge } from '@/components/status-badge'

type KpiCard = {
  label: string
  value: string
  change: string
  icon: React.ElementType
  iconBg: string
  iconColor: string
}

const kpiCards: KpiCard[] = [
  { label: 'Total livraisons', value: '0', change: '0 ce mois',       icon: Package,      iconBg: 'bg-primary/10', iconColor: 'text-primary' },
  { label: 'En cours',         value: '0', change: '0 actives',        icon: Truck,        iconBg: 'bg-amber-50',   iconColor: 'text-amber-600' },
  { label: 'Livrées',          value: '0', change: '0 ce mois',       icon: CheckCircle,  iconBg: 'bg-green-50',   iconColor: 'text-green-600' },
  { label: 'Dépenses',         value: '0 FCFA', change: '0 ce mois',  icon: Wallet,       iconBg: 'bg-blue-50',    iconColor: 'text-blue-600' },
]

type Order = {
  ref: string
  date: string
  status: string
  price: string
}

// Placeholder: remplacer par un appel API réel quand Sprint 2 (livraisons) sera implémenté
const recentOrders: Order[] = []

export default function DashboardPage() {
  const { user } = useAuthUser()

  return (
    <div className="p-6 space-y-6">
      {/* Greeting */}
      <p className="text-sm text-primary-400">
        Bonjour,{' '}
        <span className="font-semibold text-brand-foreground">{user.name}</span> 👋
      </p>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((k) => (
          <div
            key={k.label}
            className="bg-white rounded-2xl border border-brand-border shadow-sm p-5"
          >
            <div className="mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${k.iconBg}`}>
                <k.icon size={18} className={k.iconColor} />
              </div>
            </div>
            <p className="text-2xl font-bold text-brand-foreground mb-1">{k.value}</p>
            <p className="text-xs text-primary-400">{k.label}</p>
            <p className="text-xs text-green-600 font-medium mt-1">{k.change}</p>
          </div>
        ))}
      </div>

      {/* Recent orders header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-brand-foreground">Commandes récentes</h2>
        <Link
          href="/history"
          className="text-sm text-primary font-medium hover:underline flex items-center gap-1"
        >
          Voir tout <ChevronRight size={14} />
        </Link>
      </div>

      {/* Orders table or empty state */}
      <div className="bg-white rounded-2xl border border-brand-border shadow-sm overflow-hidden">
        {recentOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <Package size={28} className="text-primary" />
            </div>
            <h3 className="text-base font-semibold text-brand-foreground mb-1">
              Aucune livraison pour l&apos;instant
            </h3>
            <p className="text-sm text-primary-400 mb-6 max-w-xs">
              Créez votre première commande et suivez-la en temps réel.
            </p>
            <Link
              href="/new-delivery"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white text-sm font-semibold rounded-2xl hover:opacity-90 transition-all shadow-lg shadow-primary/25"
            >
              <PlusCircle size={18} />
              Nouvelle livraison
            </Link>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-brand-border bg-brand-muted/20">
                {['Référence', 'Date', 'Statut', 'Prix', ''].map((h) => (
                  <th
                    key={h}
                    className="px-5 py-3 text-left text-xs font-semibold text-primary-400 uppercase tracking-wide"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((o) => (
                <tr
                  key={o.ref}
                  className="border-b border-brand-border last:border-0 hover:bg-brand-muted/10 transition-colors"
                >
                  <td className="px-5 py-4 text-sm font-mono font-medium text-primary">{o.ref}</td>
                  <td className="px-5 py-4 text-sm text-primary-400">{o.date}</td>
                  <td className="px-5 py-4">
                    <StatusBadge status={o.status} />
                  </td>
                  <td className="px-5 py-4 text-sm font-semibold text-brand-foreground">{o.price}</td>
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
          <PlusCircle size={18} />
          Nouvelle livraison
        </Link>
      </div>
    </div>
  )
}
