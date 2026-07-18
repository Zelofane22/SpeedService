'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { RefreshCw, TrendingUp, Package, CheckCircle2, FileText, Box, Boxes, Container, Download } from 'lucide-react'
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
import Card from '@/components/card'
import { EmptyState } from '@/components/empty-state'
import StatCard from '@/components/stat-card'
import { getAdminReports } from '@/lib/api/admin'
import { exportRowsToCsv } from '@/lib/export'
import type { AdminReports } from '@/types/admin'

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

function monthLabel(isoMonth: string): string {
  const [year, m] = isoMonth.split('-')
  const names = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc']
  const label = names[parseInt(m, 10) - 1] ?? m
  const now = new Date()
  return now.getFullYear().toString() !== year ? `${label} ${year.slice(2)}` : label
}

function monthLabelLong(isoMonth: string): string {
  const [year, m] = isoMonth.split('-')
  const names = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
  ]
  return `${names[parseInt(m, 10) - 1] ?? m} ${year}`
}

function recentMonthBuckets(count = 6): Array<{ month: string; orders: number; revenue: number }> {
  return Array.from({ length: count }, (_, index) => {
    const date = new Date()
    date.setDate(1)
    date.setMonth(date.getMonth() - (count - index - 1))
    const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    return { month: monthLabel(month), orders: 0, revenue: 0 }
  })
}

function hasChartActivity(data: Array<{ orders: number; revenue: number }>): boolean {
  return data.some((item) => item.orders > 0 || item.revenue > 0)
}

// ---------------------------------------------------------------------------
// Package type config
// ---------------------------------------------------------------------------

const PACKAGE_TYPE_CONFIG: Record<string, { label: string; icon: React.ElementType }> = {
  document: { label: 'Document', icon: FileText },
  small:    { label: 'Petit colis', icon: Box },
  medium:   { label: 'Colis moyen', icon: Boxes },
  large:    { label: 'Gros colis', icon: Container },
}

const CHART_TOOLTIP_STYLE = {
  borderRadius: '12px',
  border: '1px solid rgb(var(--border))',
  backgroundColor: 'rgb(var(--card))',
  color: 'rgb(var(--foreground))',
  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function ReportsPage() {
  const [reports, setReports] = useState<AdminReports | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  function load(silent = false) {
    if (!silent) setLoading(true)
    else setRefreshing(true)
    getAdminReports()
      .then(setReports)
      .catch((err) => console.error('Erreur chargement rapports', err))
      .finally(() => {
        setLoading(false)
        setRefreshing(false)
      })
  }

  useEffect(() => {
    load()
  }, [])

  if (loading) {
    return (
      <div className="p-4 sm:p-6 space-y-5">
        <div className="h-7 w-40 bg-muted animate-pulse rounded-xl" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-28 bg-muted animate-pulse rounded-2xl" />
          ))}
        </div>
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="h-56 bg-muted animate-pulse rounded-2xl" />
          <div className="h-56 bg-muted animate-pulse rounded-2xl" />
        </div>
        <div className="h-64 bg-muted animate-pulse rounded-2xl" />
      </div>
    )
  }

  const revenueByMonth = reports?.revenue_by_month ?? []
  const deliveriesByMonth = reports?.deliveries_by_month ?? []
  const topClients = reports?.top_clients ?? []
  const topDrivers = reports?.top_drivers ?? []
  const byPackageType = reports?.deliveries_by_package_type ?? []

  const chartData = deliveriesByMonth.map((d) => {
    const rev = revenueByMonth.find((r) => r.month === d.month)
    return { month: monthLabel(d.month), orders: d.count, revenue: rev?.total_xof ?? 0 }
  })
  const displayedChartData = chartData.length > 0 ? chartData : recentMonthBuckets()
  const hasCharts = hasChartActivity(chartData)

  const totalRevenue6m = revenueByMonth.reduce((sum, r) => sum + r.total_xof, 0)
  const totalDeliveries6m = deliveriesByMonth.reduce((sum, d) => sum + d.count, 0)
  const maxPackageCount = Math.max(1, ...byPackageType.map((p) => p.count))

  function handleExport() {
    exportRowsToCsv('speedservice-rapports.csv', [
      { header: 'Mois', value: (row) => row.month },
      { header: 'Livraisons', value: (row) => row.orders },
      { header: 'Revenus FCFA', value: (row) => row.revenue },
    ], chartData)
  }

  return (
    <div className="p-4 sm:p-6 space-y-5 sm:space-y-6">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Rapports</h1>
          <p className="text-sm text-muted-foreground">
            Synthèse de l&apos;activité sur les 6 derniers mois.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExport}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/20 hover:text-foreground"
          >
            <Download size={16} aria-hidden="true" />
            Exporter
          </button>
          <button
            onClick={() => load(true)}
            disabled={refreshing}
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-border hover:bg-muted/30 transition-colors disabled:opacity-50 shrink-0"
            title="Rafraîchir"
            aria-label="Rafraîchir les rapports"
          >
            <RefreshCw size={18} className={`text-muted-foreground ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* ── KPIs ───────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="CA sur 6 mois"
          value={formatXOF(totalRevenue6m)}
          icon={TrendingUp}
          colorClass="bg-green-50 dark:bg-green-900/30 text-green-600"
        />
        <StatCard
          label="Livraisons sur 6 mois"
          value={String(totalDeliveries6m)}
          icon={Package}
          colorClass="bg-primary/10 text-primary"
        />
        <StatCard
          label="Taux de livraison"
          value={`${reports?.delivery_completion_rate ?? 0}%`}
          icon={CheckCircle2}
          colorClass="bg-blue-50 dark:bg-blue-900/30 text-blue-600"
          subtitle="livraisons engagées menées à terme"
        />
      </div>

      {/* ── Charts ─────────────────────────────────────────────────────── */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-foreground">Revenus (FCFA)</h2>
            <span className="text-xs text-muted-foreground">6 derniers mois</span>
          </div>
          <div className="relative">
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={displayedChartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="reportsRevenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#861D6D" stopOpacity={0.18} />
                    <stop offset="100%" stopColor="#861D6D" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--border))" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12, fill: 'rgb(var(--muted-foreground))' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: 'rgb(var(--muted-foreground))' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => formatXOF(v)}
                />
                <Tooltip
                  contentStyle={CHART_TOOLTIP_STYLE}
                  formatter={(value) => [formatXOFLong(Number(value ?? 0)), 'Revenus']}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#861D6D"
                  strokeWidth={2}
                  fill="url(#reportsRevenueGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
            {!hasCharts && (
              <EmptyState
                title="Pas encore de revenus"
                description="Les revenus mensuels apparaîtront après les premiers paiements validés."
                className="pointer-events-none absolute inset-x-4 top-6 min-h-28 bg-card/90"
              />
            )}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-foreground">Livraisons / mois</h2>
            <span className="text-xs text-muted-foreground">6 derniers mois</span>
          </div>
          <div className="relative">
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={displayedChartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--border))" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12, fill: 'rgb(var(--muted-foreground))' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: 'rgb(var(--muted-foreground))' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={CHART_TOOLTIP_STYLE}
                  formatter={(value) => [Number(value ?? 0), 'Livraisons']}
                />
                <Bar dataKey="orders" fill="#861D6D" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            {!hasCharts && (
              <EmptyState
                title="Pas encore de données"
                description="Les livraisons mensuelles apparaîtront ici dès les premières commandes."
                className="pointer-events-none absolute inset-x-4 top-6 min-h-28 bg-card/90"
              />
            )}
          </div>
        </Card>
      </div>

      {/* ── CA par mois (table) + répartition colis ─────────────────────── */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="text-base font-semibold text-foreground">Chiffre d&apos;affaires par mois</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[320px]">
              <thead>
                <tr className="bg-muted/20 border-b border-border">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Mois
                  </th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {revenueByMonth.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="px-5 py-8 text-center text-muted-foreground text-sm">
                      Pas encore de données
                    </td>
                  </tr>
                ) : (
                  revenueByMonth.map((row) => (
                    <tr key={row.month} className="border-b border-border last:border-0">
                      <td className="px-5 py-3.5 text-sm">{monthLabelLong(row.month)}</td>
                      <td className="px-5 py-3.5 text-sm font-semibold text-right">
                        {formatXOFLong(row.total_xof)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="text-base font-semibold text-foreground mb-4">Répartition par type de colis</h2>
          {byPackageType.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">Pas encore de données</p>
          ) : (
            <div className="space-y-4">
              {byPackageType.map((row) => {
                const cfg = PACKAGE_TYPE_CONFIG[row.package_type] ?? {
                  label: row.package_type,
                  icon: Package,
                }
                const Icon = cfg.icon
                return (
                  <div key={row.package_type}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <Icon size={14} className="text-primary" />
                        <span className="text-sm font-medium text-foreground">{cfg.label}</span>
                      </div>
                      <span className="text-sm font-semibold text-foreground">{row.count}</span>
                    </div>
                    <div className="h-2 bg-muted/40 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${(row.count / maxPackageCount) * 100}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </Card>
      </div>

      {/* ── Top clients + top livreurs ──────────────────────────────────── */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="overflow-hidden">
          <div className="px-5 py-4 flex items-center justify-between border-b border-border">
            <h2 className="text-base font-semibold text-foreground">Top 5 clients</h2>
            <Link href="/clients" className="text-sm text-primary font-medium hover:underline">
              Voir tout
            </Link>
          </div>
          <div className="divide-y divide-border">
            {topClients.length === 0 ? (
              <p className="px-5 py-8 text-center text-muted-foreground text-sm">Pas encore de données</p>
            ) : (
              topClients.map((c, i) => (
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
                    <p className="text-xs text-muted-foreground">
                      {c.count} commande{c.count > 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card className="overflow-hidden">
          <div className="px-5 py-4 flex items-center justify-between border-b border-border">
            <h2 className="text-base font-semibold text-foreground">Top 5 livreurs</h2>
            <Link href="/drivers" className="text-sm text-primary font-medium hover:underline">
              Voir tout
            </Link>
          </div>
          <div className="divide-y divide-border">
            {topDrivers.length === 0 ? (
              <p className="px-5 py-8 text-center text-muted-foreground text-sm">Pas encore de données</p>
            ) : (
              topDrivers.map((d, i) => (
                <div key={d.email} className="px-5 py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0">
                      {i + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{d.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{d.email}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold text-foreground">{formatXOF(d.total_xof)}</p>
                    <p className="text-xs text-muted-foreground">
                      {d.count} livraison{d.count > 1 ? 's' : ''} terminée{d.count > 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
