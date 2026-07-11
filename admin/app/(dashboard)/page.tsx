'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import {
  Package,
  Users,
  Truck,
  TrendingUp,
  RefreshCw,
  Download,
  Eye,
  AlertTriangle,
  CheckCircle2,
  Clock,
  XCircle,
  Wallet,
  ShoppingBag,
  Activity,
  Banknote,
  CreditCard,
  Smartphone,
  Building2,
  ChevronRight,
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
import { getAdminStats, getAdminDeliveries, getAdminReports } from '@/lib/api/admin'
import type { AdminStats, AdminReports, AdminDelivery } from '@/types/admin'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatXOF(amount: number): string {
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}M FCFA`
  if (amount >= 1_000) return `${(amount / 1_000).toFixed(0)}K FCFA`
  return `${amount.toLocaleString('fr-FR')} FCFA`
}

function formatXOFLong(amount: number): string {
  return `${amount.toLocaleString('fr-FR')} FCFA`
}

function trendProps(pct: number | null | undefined, vsLabel: string): { change?: string; up?: boolean } {
  if (pct === null || pct === undefined) return {}
  const formatted = `${pct > 0 ? '+' : ''}${pct.toLocaleString('fr-FR', { maximumFractionDigits: 1 })}% ${vsLabel}`
  return { change: formatted, up: pct >= 0 }
}

function monthLabel(isoMonth: string): string {
  const [year, m] = isoMonth.split('-')
  const names = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc']
  const label = names[parseInt(m, 10) - 1] ?? m
  const now = new Date()
  return now.getFullYear().toString() !== year ? `${label} ${year.slice(2)}` : label
}

// ---------------------------------------------------------------------------
// Status config
// ---------------------------------------------------------------------------

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  draft:               { label: 'Brouillon',       color: 'text-gray-500',   bg: 'bg-gray-100 dark:bg-gray-800' },
  awaiting_payment:    { label: 'At. paiement',    color: 'text-blue-500',   bg: 'bg-blue-50 dark:bg-blue-900/30' },
  awaiting_validation: { label: 'À valider',       color: 'text-amber-600',  bg: 'bg-amber-50 dark:bg-amber-900/30' },
  confirmed:           { label: 'Confirmée',       color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/30' },
  assigned:            { label: 'Assignée',        color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/30' },
  picking_up:          { label: 'En collecte',     color: 'text-cyan-600',   bg: 'bg-cyan-50 dark:bg-cyan-900/30' },
  in_delivery:         { label: 'En livraison',    color: 'text-primary',    bg: 'bg-primary/10' },
  delivered:           { label: 'Livrée',          color: 'text-green-600',  bg: 'bg-green-50 dark:bg-green-900/30' },
  cancelled:           { label: 'Annulée',         color: 'text-red-500',    bg: 'bg-red-50 dark:bg-red-900/30' },
}

const STATUS_ORDER = [
  'draft', 'awaiting_payment', 'awaiting_validation', 'confirmed',
  'assigned', 'picking_up', 'in_delivery', 'delivered', 'cancelled',
]

// ---------------------------------------------------------------------------
// Payment method config
// ---------------------------------------------------------------------------

const METHOD_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  mtn_momo:         { label: 'MTN MoMo',          icon: Smartphone, color: 'text-yellow-600' },
  moov_money:       { label: 'MoovMoney',          icon: Smartphone, color: 'text-blue-600' },
  card:             { label: 'Carte bancaire',     icon: CreditCard, color: 'text-indigo-600' },
  cash_on_delivery: { label: 'Paiement livraison', icon: Banknote,   color: 'text-green-600' },
  agency:           { label: 'Agence',             icon: Building2,  color: 'text-purple-600' },
}

// ---------------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------------

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`bg-muted animate-pulse rounded-xl ${className}`} />
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function DashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [reports, setReports] = useState<AdminReports | null>(null)
  const [deliveries, setDeliveries] = useState<AdminDelivery[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [adminName, setAdminName] = useState('')

  useEffect(() => {
    try {
      const stored = localStorage.getItem('user')
      if (stored) setAdminName((JSON.parse(stored) as { name?: string }).name ?? '')
    } catch {
      // ignore parse errors
    }
  }, [])

  const todayLabel = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const loadData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    else setRefreshing(true)
    try {
      const [statsData, deliveriesData, reportsData] = await Promise.all([
        getAdminStats(),
        getAdminDeliveries({ page: 1 }),
        getAdminReports(),
      ])
      setStats(statsData)
      setDeliveries(deliveriesData.data ?? [])
      setReports(reportsData)
    } catch (err) {
      console.error('Erreur chargement dashboard', err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  // Merge monthly data for charts
  const chartData = reports
    ? reports.deliveries_by_month.map((d) => {
        const rev = reports.revenue_by_month.find((r) => r.month === d.month)
        return { month: monthLabel(d.month), orders: d.count, revenue: rev?.total_xof ?? 0 }
      })
    : []

  // ---------------------------------------------------------------------------
  // Loading skeleton
  // ---------------------------------------------------------------------------

  if (loading) {
    return (
      <div className="p-4 sm:p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28" />)}
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28" />)}
        </div>
        <div className="grid lg:grid-cols-2 gap-6">
          <Skeleton className="h-56" />
          <Skeleton className="h-56" />
        </div>
        <Skeleton className="h-64" />
      </div>
    )
  }

  const byStatus = stats?.deliveries.by_status ?? {}
  const pendingValidations = stats?.pending_validations ?? 0

  return (
    <div className="p-4 sm:p-6 space-y-5 sm:space-y-6">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Bonjour, {adminName || 'Admin'} 👋
          </h1>
          <p className="text-sm text-muted-foreground capitalize">{todayLabel}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => loadData(true)}
            disabled={refreshing}
            className="p-2 rounded-xl border border-border hover:bg-muted/30 transition-colors disabled:opacity-50"
            title="Rafraîchir"
          >
            <RefreshCw size={18} className={`text-muted-foreground ${refreshing ? 'animate-spin' : ''}`} />
          </button>
          <button className="p-2 rounded-xl border border-border hover:bg-muted/30 transition-colors" title="Exporter">
            <Download size={18} className="text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* ── Alerte urgente : validations en attente ─────────────────────── */}
      {pendingValidations > 0 && (
        <div className="flex items-center justify-between gap-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-2xl px-5 py-3.5">
          <div className="flex items-center gap-3">
            <AlertTriangle size={18} className="text-amber-600 shrink-0" />
            <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
              {pendingValidations} paiement{pendingValidations > 1 ? 's' : ''} en attente de validation manuelle
            </p>
          </div>
          <Link
            href="/payments"
            className="flex items-center gap-1 text-xs font-semibold text-amber-700 dark:text-amber-400 hover:underline shrink-0"
          >
            Valider <ChevronRight size={14} />
          </Link>
        </div>
      )}

      {/* ── Section : Opérationnel temps réel ──────────────────────────── */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
          Opérationnel — temps réel
        </p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Commandes actives"
            value={String(stats?.deliveries.active_count ?? 0)}
            icon={Activity}
            colorClass="bg-primary/10 text-primary"
            subtitle="confirmées → en livraison"
          />
          <StatCard
            label="En livraison"
            value={String(byStatus['in_delivery'] ?? 0)}
            icon={Truck}
            colorClass="bg-blue-50 dark:bg-blue-900/30 text-blue-600"
            subtitle={`${byStatus['picking_up'] ?? 0} en collecte`}
          />
          <StatCard
            label="Livrées aujourd'hui"
            value={String(stats?.deliveries.today?.delivered ?? 0)}
            icon={CheckCircle2}
            colorClass="bg-green-50 dark:bg-green-900/30 text-green-600"
            subtitle={`${stats?.deliveries.today?.total ?? 0} créées`}
          />
          <StatCard
            label="Annulées aujourd'hui"
            value={String(stats?.deliveries.today?.cancelled ?? 0)}
            icon={XCircle}
            colorClass="bg-red-50 dark:bg-red-900/30 text-red-500"
            subtitle={`Taux livraison : ${stats?.completion_rate ?? 0}%`}
          />
        </div>
      </div>

      {/* ── Section : Finances & trafic ────────────────────────────────── */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
          Finances & trafic
        </p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="CA aujourd'hui"
            value={formatXOF(stats?.revenue.today_xof ?? 0)}
            icon={TrendingUp}
            colorClass="bg-green-50 dark:bg-green-900/30 text-green-600"
            {...trendProps(stats?.trends?.revenue_today_pct, 'vs hier')}
          />
          <StatCard
            label="CA ce mois"
            value={formatXOF(stats?.revenue.this_month_xof ?? 0)}
            icon={Wallet}
            colorClass="bg-primary/10 text-primary"
            {...trendProps(stats?.trends?.revenue_month_pct, 'vs mois dernier')}
          />
          <StatCard
            label="Panier moyen"
            value={formatXOF(stats?.revenue.avg_basket_xof ?? 0)}
            icon={ShoppingBag}
            colorClass="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600"
          />
          <StatCard
            label="Clients / Livreurs"
            value={`${stats?.users.clients ?? 0} / ${stats?.users.drivers ?? 0}`}
            icon={Users}
            colorClass="bg-amber-50 dark:bg-amber-900/30 text-amber-600"
            subtitle={`${stats?.users.total ?? 0} utilisateurs · +${stats?.trends?.new_clients_month ?? 0} client${(stats?.trends?.new_clients_month ?? 0) > 1 ? 's' : ''} ce mois`}
            {...trendProps(stats?.trends?.new_clients_month_pct, 'vs mois dernier')}
          />
        </div>
      </div>

      {/* ── Répartition des statuts ─────────────────────────────────────── */}
      <Card className="p-5">
        <h2 className="text-sm font-semibold text-foreground mb-4">Répartition des commandes par statut</h2>
        <div className="flex flex-wrap gap-2">
          {STATUS_ORDER.map((s) => {
            const cfg = STATUS_CONFIG[s]
            const count = byStatus[s] ?? 0
            return (
              <div
                key={s}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium ${cfg.bg} ${cfg.color}`}
              >
                <span>{cfg.label}</span>
                <span className="font-extrabold">{count}</span>
              </div>
            )
          })}
        </div>
      </Card>

      {/* ── Charts ─────────────────────────────────────────────────────── */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-foreground">Livraisons / mois</h2>
            <span className="text-xs text-muted-foreground">6 derniers mois</span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: '12px',
                  border: '1px solid var(--border)',
                  backgroundColor: 'var(--card)',
                  color: 'var(--foreground)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                }}
                formatter={(v: number) => [v, 'Livraisons']}
              />
              <Bar dataKey="orders" fill="#861D6D" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-foreground">Revenus (FCFA)</h2>
            <span className="text-xs text-muted-foreground">6 derniers mois</span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#861D6D" stopOpacity={0.18} />
                  <stop offset="100%" stopColor="#861D6D" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => formatXOF(v)}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: '12px',
                  border: '1px solid var(--border)',
                  backgroundColor: 'var(--card)',
                  color: 'var(--foreground)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                }}
                formatter={(v: number) => [formatXOFLong(v), 'Revenus']}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#861D6D"
                strokeWidth={2}
                fill="url(#revenueGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* ── Méthodes de paiement ────────────────────────────────────────── */}
      {stats?.revenue.by_method && Object.keys(stats.revenue.by_method).length > 0 && (
        <Card className="p-5">
          <h2 className="text-sm font-semibold text-foreground mb-4">Revenus par méthode de paiement</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {Object.entries(stats.revenue.by_method).map(([method, data]) => {
              const cfg = METHOD_CONFIG[method] ?? { label: method, icon: Package, color: 'text-muted-foreground' }
              const Icon = cfg.icon
              return (
                <div key={method} className="bg-muted/20 rounded-xl p-3 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Icon size={15} className={cfg.color} />
                    <span className="text-xs font-medium text-foreground">{cfg.label}</span>
                  </div>
                  <p className="text-sm font-extrabold text-foreground">{formatXOF(data.total_xof)}</p>
                  <p className="text-xs text-muted-foreground">{data.count} paiement{data.count > 1 ? 's' : ''}</p>
                </div>
              )
            })}
          </div>
        </Card>
      )}

      {/* ── Top clients ─────────────────────────────────────────────────── */}
      {reports && reports.top_clients.length > 0 && (
        <Card className="overflow-hidden">
          <div className="px-5 py-4 flex items-center justify-between border-b border-border">
            <h2 className="text-base font-semibold text-foreground">Top 5 clients</h2>
            <Link href="/clients" className="text-sm text-primary font-medium hover:underline">
              Voir tout
            </Link>
          </div>
          <div className="divide-y divide-border">
            {reports.top_clients.map((c, i) => (
              <div key={c.email} className="px-5 py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0">
                    {i + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{c.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{c.email}</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold text-foreground">{formatXOF(c.total_xof)}</p>
                  <p className="text-xs text-muted-foreground">{c.count} commande{c.count > 1 ? 's' : ''}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* ── Dernières commandes ─────────────────────────────────────────── */}
      <Card className="overflow-hidden">
        <div className="px-5 py-4 flex items-center justify-between border-b border-border">
          <h2 className="text-base font-semibold text-foreground">Dernières commandes</h2>
          <Link href="/orders" className="text-sm text-primary font-medium hover:underline">
            Voir tout
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px]">
            <thead>
              <tr className="bg-muted/20 border-b border-border">
                {['Référence', 'Client', 'Trajet', 'Statut', 'Montant', 'Actions'].map((h) => (
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
                  <td colSpan={6} className="px-5 py-8 text-center text-muted-foreground text-sm">
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
                      <span className="font-mono text-primary text-xs">{d.reference}</span>
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
        </div>
      </Card>
    </div>
  )
}
