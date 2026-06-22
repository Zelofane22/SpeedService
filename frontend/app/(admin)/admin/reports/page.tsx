'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Type definitions
// ---------------------------------------------------------------------------
interface AdminReport {
  revenue_by_month: Array<{ month: string; total_xof: number }>
  deliveries_by_month: Array<{ month: string; count: number }>
  top_clients: Array<{ name: string; email: string; count: number; total_xof: number }>
  delivery_completion_rate: number
}

// ---------------------------------------------------------------------------
// API helper (inline fallback — mirrors lib/api/admin.ts)
// ---------------------------------------------------------------------------
const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api'

function authHeaders(): Record<string, string> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
  return token ? { Authorization: `Bearer ${token}` } : {}
}

let getAdminReports: () => Promise<AdminReport>

try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const adminApi = require('@/lib/api/admin')
  getAdminReports = adminApi.getAdminReports
} catch {
  getAdminReports = async () => {
    const res = await fetch(`${BASE_URL}/admin/reports`, {
      headers: { Accept: 'application/json', ...authHeaders() },
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message ?? 'Erreur')
    return data
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function fmtCurrency(amount: number) {
  return amount.toLocaleString('fr-FR') + ' FCFA'
}

function fmtMonth(month: string) {
  // month is expected as "YYYY-MM"
  const [year, m] = month.split('-')
  const date = new Date(Number(year), Number(m) - 1, 1)
  return date.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' })
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------
function SkeletonChart() {
  return (
    <div className="flex items-end gap-3 h-40">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div
            className="w-full bg-gray-200 rounded-t animate-pulse"
            style={{ height: `${30 + Math.random() * 60}%` }}
          />
          <div className="h-3 w-6 bg-gray-200 rounded animate-pulse" />
        </div>
      ))}
    </div>
  )
}

function BarChart({
  data,
  getValue,
  getLabel,
  color,
  formatValue,
}: {
  data: unknown[]
  getValue: (item: unknown) => number
  getLabel: (item: unknown) => string
  color: string
  formatValue: (v: number) => string
}) {
  const maxValue = Math.max(...data.map(getValue), 1)

  return (
    <div className="flex items-end gap-2 h-40">
      {data.map((item, i) => {
        const value = getValue(item)
        const heightPct = (value / maxValue) * 100
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
            {/* Tooltip */}
            <div className="relative flex-1 w-full flex items-end">
              <div
                title={formatValue(value)}
                className={cn(
                  'w-full rounded-t transition-all duration-300 cursor-default relative',
                  color
                )}
                style={{ height: `${Math.max(heightPct, 2)}%` }}
              >
                {/* Hover tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                  {formatValue(value)}
                </div>
              </div>
            </div>
            <span className="text-xs text-gray-400 text-center leading-tight">{getLabel(item)}</span>
          </div>
        )
      })}
    </div>
  )
}

function StatCard({
  title,
  value,
  subtitle,
  color,
}: {
  title: string
  value: string
  subtitle?: string
  color: string
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <p className={cn('text-3xl font-bold mt-1', color)}>{value}</p>
      {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------
export default function AdminReportsPage() {
  const [report, setReport] = useState<AdminReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetch = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await getAdminReports()
        setReport(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur lors du chargement')
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  // Compute totals from report data
  const totalRevenue = report
    ? report.revenue_by_month.reduce((sum, m) => sum + m.total_xof, 0)
    : 0

  const totalDeliveries = report
    ? report.deliveries_by_month.reduce((sum, m) => sum + m.count, 0)
    : 0

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#1D1D1F]">Rapports</h1>
        <p className="text-sm text-gray-500 mt-0.5">Statistiques des 6 derniers mois</p>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
          <button onClick={() => setError(null)} className="ml-2 underline">Fermer</button>
        </div>
      )}

      {/* Summary stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <div className="h-4 w-32 bg-gray-200 rounded animate-pulse mb-2" />
              <div className="h-8 w-24 bg-gray-200 rounded animate-pulse" />
            </div>
          ))
        ) : report ? (
          <>
            <StatCard
              title="Revenus (6 mois)"
              value={fmtCurrency(totalRevenue)}
              subtitle="Total cumulé"
              color="text-[#861D6D]"
            />
            <StatCard
              title="Livraisons (6 mois)"
              value={totalDeliveries.toLocaleString('fr-FR')}
              subtitle="Commandes traitées"
              color="text-blue-600"
            />
            <StatCard
              title="Taux de complétion"
              value={`${report.delivery_completion_rate.toFixed(1)} %`}
              subtitle="Livraisons terminées vs total"
              color={report.delivery_completion_rate >= 80 ? 'text-green-600' : 'text-amber-600'}
            />
          </>
        ) : null}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-base font-semibold text-[#1D1D1F] mb-1">Revenus mensuels</h2>
          <p className="text-xs text-gray-400 mb-5">En FCFA — 6 derniers mois</p>
          {loading ? (
            <SkeletonChart />
          ) : report && report.revenue_by_month.length > 0 ? (
            <BarChart
              data={report.revenue_by_month}
              getValue={(item) => (item as { total_xof: number }).total_xof}
              getLabel={(item) => fmtMonth((item as { month: string }).month)}
              color="bg-[#861D6D] hover:bg-[#B24799]"
              formatValue={fmtCurrency}
            />
          ) : (
            <div className="h-40 flex items-center justify-center text-gray-400 text-sm">
              Aucune donnée disponible
            </div>
          )}
        </div>

        {/* Deliveries chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-base font-semibold text-[#1D1D1F] mb-1">Livraisons par mois</h2>
          <p className="text-xs text-gray-400 mb-5">Nombre de commandes — 6 derniers mois</p>
          {loading ? (
            <SkeletonChart />
          ) : report && report.deliveries_by_month.length > 0 ? (
            <BarChart
              data={report.deliveries_by_month}
              getValue={(item) => (item as { count: number }).count}
              getLabel={(item) => fmtMonth((item as { month: string }).month)}
              color="bg-blue-500 hover:bg-blue-600"
              formatValue={(v) => `${v} livraison${v !== 1 ? 's' : ''}`}
            />
          ) : (
            <div className="h-40 flex items-center justify-center text-gray-400 text-sm">
              Aucune donnée disponible
            </div>
          )}
        </div>
      </div>

      {/* Completion rate — large display */}
      {!loading && report && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            <div className="flex-1">
              <h2 className="text-base font-semibold text-[#1D1D1F] mb-1">Taux de complétion</h2>
              <p className="text-sm text-gray-500">
                Proportion de livraisons arrivées à destination par rapport au total des commandes.
              </p>
            </div>
            <div className="flex items-baseline gap-2">
              <span
                className={cn(
                  'text-6xl font-bold tabular-nums',
                  report.delivery_completion_rate >= 80
                    ? 'text-green-600'
                    : report.delivery_completion_rate >= 60
                    ? 'text-amber-500'
                    : 'text-red-500'
                )}
              >
                {report.delivery_completion_rate.toFixed(1)}
              </span>
              <span className="text-2xl font-semibold text-gray-400">%</span>
            </div>
          </div>
          {/* Progress bar */}
          <div className="mt-5 h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-700',
                report.delivery_completion_rate >= 80
                  ? 'bg-green-500'
                  : report.delivery_completion_rate >= 60
                  ? 'bg-amber-400'
                  : 'bg-red-500'
              )}
              style={{ width: `${Math.min(report.delivery_completion_rate, 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Top 5 clients */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-[#1D1D1F]">Top 5 clients</h2>
          <p className="text-xs text-gray-400 mt-0.5">Clients les plus actifs sur la période</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-8">#</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Nom</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Commandes</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Total XOF</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-gray-50">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-gray-200 rounded animate-pulse" style={{ width: j === 0 ? '20px' : '80%' }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : report && report.top_clients.length > 0 ? (
                report.top_clients.map((client, index) => (
                  <tr key={index} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-3">
                      <span
                        className={cn(
                          'inline-flex items-center justify-center h-6 w-6 rounded-full text-xs font-bold',
                          index === 0
                            ? 'bg-yellow-100 text-yellow-700'
                            : index === 1
                            ? 'bg-gray-100 text-gray-600'
                            : index === 2
                            ? 'bg-amber-50 text-amber-600'
                            : 'bg-gray-50 text-gray-400'
                        )}
                      >
                        {index + 1}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="h-7 w-7 rounded-full bg-[#861D6D]/10 flex items-center justify-center text-[#861D6D] text-xs font-bold flex-shrink-0">
                          {client.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-medium text-[#1D1D1F]">{client.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{client.email}</td>
                    <td className="px-4 py-3 text-sm text-right font-semibold text-[#1D1D1F] tabular-nums">
                      {client.count}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-semibold text-[#861D6D] tabular-nums">
                      {fmtCurrency(client.total_xof)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-gray-400 text-sm">
                    Aucun client trouvé
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
