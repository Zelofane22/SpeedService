'use client'

import { useEffect, useState } from 'react'
import { Users, Package, Banknote, ClipboardCheck } from 'lucide-react'
import { getAdminStats } from '@/lib/api/admin'
import { StatCard } from '@/components/admin/StatCard'
import { PageHeader } from '@/components/admin/PageHeader'
import { StatusBadge } from '@/components/admin/StatusBadge'
import type { AdminStats } from '@/types/admin'

const STATUS_ORDER = [
  'draft',
  'awaiting_payment',
  'awaiting_validation',
  'confirmed',
  'assigned',
  'picking_up',
  'in_delivery',
  'delivered',
  'cancelled',
]

function formatXof(amount: number): string {
  return amount.toLocaleString('fr-FR') + ' FCFA'
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-brand-border bg-white p-6 animate-pulse">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-gray-200 shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-6 bg-gray-200 rounded w-1/2" />
        </div>
      </div>
    </div>
  )
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getAdminStats()
      .then((data) => {
        setStats(data)
        setLoading(false)
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Erreur lors du chargement des statistiques')
        setLoading(false)
      })
  }, [])

  return (
    <div className="space-y-8">
      <PageHeader
        title="Tableau de bord"
        subtitle="Vue d'ensemble de l'activité SpeedService"
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : error ? (
          <div className="col-span-full rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700 text-sm">
            {error}
          </div>
        ) : stats ? (
          <>
            <StatCard
              title="Total Utilisateurs"
              value={stats.users.total.toLocaleString('fr-FR')}
              icon={<Users size={22} />}
            />
            <StatCard
              title="Total Livraisons"
              value={stats.deliveries.total.toLocaleString('fr-FR')}
              icon={<Package size={22} />}
            />
            <StatCard
              title="Revenu du mois"
              value={formatXof(stats.revenue.this_month_xof)}
              icon={<Banknote size={22} />}
            />
            <StatCard
              title="Validations en attente"
              value={stats.pending_validations}
              icon={<ClipboardCheck size={22} />}
              color={stats.pending_validations > 0 ? 'bg-yellow-50' : 'bg-white'}
            />
          </>
        ) : null}
      </div>

      {/* Users breakdown */}
      {!loading && !error && stats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Users breakdown */}
          <div className="rounded-2xl border border-brand-border bg-white p-6">
            <h2 className="text-base font-semibold text-brand-foreground mb-4">Répartition utilisateurs</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-brand-border last:border-0">
                <span className="text-sm text-gray-600">Clients</span>
                <span className="text-sm font-semibold text-brand-foreground">{stats.users.clients.toLocaleString('fr-FR')}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-brand-border last:border-0">
                <span className="text-sm text-gray-600">Livreurs</span>
                <span className="text-sm font-semibold text-brand-foreground">{stats.users.drivers.toLocaleString('fr-FR')}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-600">Total</span>
                <span className="text-sm font-bold text-primary">{stats.users.total.toLocaleString('fr-FR')}</span>
              </div>
            </div>
          </div>

          {/* Deliveries by status */}
          <div className="rounded-2xl border border-brand-border bg-white p-6">
            <h2 className="text-base font-semibold text-brand-foreground mb-4">Livraisons par statut</h2>
            <div className="space-y-2">
              {STATUS_ORDER.filter((s) => stats.deliveries.by_status[s] !== undefined).map((status) => (
                <div key={status} className="flex items-center justify-between py-1.5">
                  <StatusBadge status={status} />
                  <span className="text-sm font-semibold text-brand-foreground">
                    {(stats.deliveries.by_status[status] ?? 0).toLocaleString('fr-FR')}
                  </span>
                </div>
              ))}
              {/* Any statuses not in our known order */}
              {Object.keys(stats.deliveries.by_status)
                .filter((s) => !STATUS_ORDER.includes(s))
                .map((status) => (
                  <div key={status} className="flex items-center justify-between py-1.5">
                    <StatusBadge status={status} />
                    <span className="text-sm font-semibold text-brand-foreground">
                      {(stats.deliveries.by_status[status] ?? 0).toLocaleString('fr-FR')}
                    </span>
                  </div>
                ))}
            </div>
          </div>

          {/* Revenue summary */}
          <div className="rounded-2xl border border-brand-border bg-white p-6 lg:col-span-2">
            <h2 className="text-base font-semibold text-brand-foreground mb-4">Revenus</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-xl bg-brand-background p-4">
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Ce mois</p>
                <p className="mt-1 text-xl font-bold text-primary">{formatXof(stats.revenue.this_month_xof)}</p>
              </div>
              <div className="rounded-xl bg-brand-background p-4">
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Total cumulé</p>
                <p className="mt-1 text-xl font-bold text-brand-foreground">{formatXof(stats.revenue.total_xof)}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
