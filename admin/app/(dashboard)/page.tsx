'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Package,
  Users,
  Truck,
  TrendingUp,
  Calendar,
  Download,
  Eye,
} from 'lucide-react'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import StatCard from '@/components/stat-card'
import StatusBadge from '@/components/status-badge'
import Card from '@/components/card'
import { getAdminStats, getAdminDeliveries } from '@/lib/api/admin'
import type { AdminStats, AdminDelivery } from '@/types/admin'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatXOF(amount: number): string {
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}M FCFA`
  return `${amount.toLocaleString('fr-FR')} FCFA`
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

// ---------------------------------------------------------------------------
// Local mock data for charts
// ---------------------------------------------------------------------------

const chartData = [
  { month: 'Jan', orders: 142, revenue: 420000 },
  { month: 'Fév', orders: 168, revenue: 510000 },
  { month: 'Mar', orders: 195, revenue: 580000 },
  { month: 'Avr', orders: 210, revenue: 640000 },
  { month: 'Mai', orders: 183, revenue: 555000 },
  { month: 'Juin', orders: 234, revenue: 710000 },
]

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function DashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [deliveries, setDeliveries] = useState<AdminDelivery[]>([])
  const [loading, setLoading] = useState(true)

  const todayLabel = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  useEffect(() => {
    async function loadData() {
      try {
        const [statsData, deliveriesData] = await Promise.all([
          getAdminStats(),
          getAdminDeliveries({ page: 1 }),
        ])
        setStats(statsData)
        setDeliveries(deliveriesData.data ?? deliveriesData)
      } catch (err) {
        console.error('Erreur chargement dashboard', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-12 bg-muted animate-pulse rounded-xl" />
        ))}
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Tableau de bord</h1>
          <p className="text-sm text-muted-foreground capitalize">{todayLabel}</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-xl border border-border hover:bg-muted/30 transition-colors">
            <Calendar size={18} className="text-muted-foreground" />
          </button>
          <button className="p-2 rounded-xl border border-border hover:bg-muted/30 transition-colors">
            <Download size={18} className="text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Commandes"
          value={String(stats?.deliveries.total ?? 0)}
          change="+12%"
          up={true}
          icon={Package}
          colorClass="bg-primary/10 text-primary"
        />
        <StatCard
          label="Clients"
          value={String(stats?.users.clients ?? 0)}
          change="+8%"
          up={true}
          icon={Users}
          colorClass="bg-blue-50 text-blue-600"
        />
        <StatCard
          label="Livreurs actifs"
          value={String(stats?.users.drivers ?? 0)}
          change="+3%"
          up={true}
          icon={Truck}
          colorClass="bg-amber-50 text-amber-600"
        />
        <StatCard
          label="Chiffre d'affaires"
          value={formatXOF(stats?.revenue?.total_xof ?? 0)}
          change="+18%"
          up={true}
          icon={TrendingUp}
          colorClass="bg-green-50 text-green-600"
        />
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Bar Chart — Livraisons */}
        <Card className="p-6">
          <h2 className="text-base font-semibold text-foreground mb-4">
            Livraisons par mois
          </h2>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart
              data={chartData}
              margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--border))" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12, fill: 'rgb(var(--muted-foreground))' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis tick={{ fontSize: 12, fill: 'rgb(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  borderRadius: '12px',
                  border: '1px solid rgb(var(--border))',
                  backgroundColor: 'rgb(var(--card))',
                  color: 'rgb(var(--foreground))',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                }}
              />
              <Bar dataKey="orders" fill="rgb(var(--chart-primary))" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Area Chart — Revenus */}
        <Card className="p-6">
          <h2 className="text-base font-semibold text-foreground mb-4">
            Revenus (FCFA)
          </h2>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart
              data={chartData}
              margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgb(var(--chart-primary))" stopOpacity={0.18} />
                  <stop offset="100%" stopColor="rgb(var(--chart-primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--border))" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12, fill: 'rgb(var(--muted-foreground))' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis tick={{ fontSize: 12, fill: 'rgb(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  borderRadius: '12px',
                  border: '1px solid rgb(var(--border))',
                  backgroundColor: 'rgb(var(--card))',
                  color: 'rgb(var(--foreground))',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                }}
                formatter={(v: number) => [formatXOF(v), 'Revenus']}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="rgb(var(--chart-primary))"
                strokeWidth={2}
                fill="url(#revenueGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Recent Deliveries */}
      <Card className="overflow-hidden">
        <div className="px-5 py-4 flex items-center justify-between border-b border-border">
          <h2 className="text-base font-semibold text-foreground">
            Dernières commandes
          </h2>
          <Link
            href="/orders"
            className="text-sm text-primary font-medium hover:underline"
          >
            Voir tout
          </Link>
        </div>
        <table className="w-full">
          <thead>
            <tr className="bg-muted/20 border-b border-border">
              {[
                'Référence',
                'Client',
                'Trajet',
                'Statut',
                'Montant',
                'Actions',
              ].map((h) => (
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
            {deliveries.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-5 py-8 text-center text-muted-foreground text-sm"
                >
                  Aucune commande trouvée
                </td>
              </tr>
            ) : (
              deliveries.map((d) => (
                <tr
                  key={d.id}
                  className="border-b border-border last:border-0 hover:bg-muted/10 transition-colors"
                >
                  <td className="px-5 py-4">
                    <span className="font-mono text-primary text-xs">
                      {d.reference}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm">{d.client?.name ?? '—'}</td>
                  <td className="px-5 py-4 text-xs text-muted-foreground">
                    {d.from_address ?? '—'} → {d.to_address ?? '—'}
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={d.status} />
                  </td>
                  <td className="px-5 py-4 text-sm font-semibold">
                    {formatXOF(d.amount_xof ?? 0)}
                  </td>
                  <td className="px-5 py-4">
                    <Link href={`/orders/${d.id}`}>
                      <button className="p-1.5 rounded-lg hover:bg-muted/30 transition-colors">
                        <Eye size={15} className="text-muted-foreground" />
                      </button>
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>
    </div>
  )
}
