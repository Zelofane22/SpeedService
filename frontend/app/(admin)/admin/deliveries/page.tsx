'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Type definitions
// ---------------------------------------------------------------------------
interface AdminDelivery {
  id: string
  status: string
  payment_method: string
  amount_xof: number
  created_at: string
  client: { name: string }
  driver: { name: string } | null
}

interface PaginationMeta {
  current_page: number
  last_page: number
  total: number
}

// ---------------------------------------------------------------------------
// API helpers (inline fallback — mirrors lib/api/admin.ts)
// ---------------------------------------------------------------------------
const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api'

function authHeaders(): Record<string, string> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
  return token ? { Authorization: `Bearer ${token}` } : {}
}

let getAdminDeliveries: (params: {
  page?: number
  search?: string
  status?: string
  payment_method?: string
}) => Promise<{ data: AdminDelivery[]; meta: PaginationMeta }>

let updateDeliveryStatus: (id: string, status: string) => Promise<AdminDelivery>
let validatePayment: (id: string) => Promise<AdminDelivery>

try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const adminApi = require('@/lib/api/admin')
  getAdminDeliveries = adminApi.getAdminDeliveries
  updateDeliveryStatus = adminApi.updateDeliveryStatus
  validatePayment = adminApi.validatePayment
} catch {
  getAdminDeliveries = async ({ page = 1, search = '', status = '', payment_method = '' }) => {
    const params = new URLSearchParams({ page: String(page) })
    if (search) params.set('search', search)
    if (status) params.set('status', status)
    if (payment_method) params.set('payment_method', payment_method)
    const res = await fetch(`${BASE_URL}/admin/deliveries?${params}`, {
      headers: { Accept: 'application/json', ...authHeaders() },
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message ?? 'Erreur')
    return data
  }
  updateDeliveryStatus = async (id: string, status: string) => {
    const res = await fetch(`${BASE_URL}/admin/deliveries/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json', ...authHeaders() },
      body: JSON.stringify({ status }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message ?? 'Erreur')
    return data
  }
  validatePayment = async (id: string) => {
    const res = await fetch(`${BASE_URL}/admin/deliveries/${id}/validate-payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json', ...authHeaders() },
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message ?? 'Erreur')
    return data
  }
}

// ---------------------------------------------------------------------------
// Status configuration
// ---------------------------------------------------------------------------
const STATUS_OPTIONS = [
  { value: 'draft', label: 'Brouillon' },
  { value: 'awaiting_payment', label: 'En attente de paiement' },
  { value: 'awaiting_validation', label: 'En attente de validation' },
  { value: 'confirmed', label: 'Confirmée' },
  { value: 'assigned', label: 'Assignée' },
  { value: 'picking_up', label: 'En cours de récupération' },
  { value: 'in_delivery', label: 'En livraison' },
  { value: 'delivered', label: 'Livrée' },
  { value: 'cancelled', label: 'Annulée' },
]

const statusConfig: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  draft:                { label: 'Brouillon',                bg: 'bg-gray-100',   text: 'text-gray-600',   dot: 'bg-gray-400' },
  awaiting_payment:     { label: 'Att. paiement',            bg: 'bg-yellow-50',  text: 'text-yellow-700', dot: 'bg-yellow-400' },
  awaiting_validation:  { label: 'Att. validation',          bg: 'bg-amber-50',   text: 'text-amber-700',  dot: 'bg-amber-400' },
  confirmed:            { label: 'Confirmée',                bg: 'bg-blue-50',    text: 'text-blue-700',   dot: 'bg-blue-500' },
  assigned:             { label: 'Assignée',                 bg: 'bg-indigo-50',  text: 'text-indigo-700', dot: 'bg-indigo-400' },
  picking_up:           { label: 'Récupération',             bg: 'bg-purple-50',  text: 'text-purple-700', dot: 'bg-purple-400' },
  in_delivery:          { label: 'En livraison',             bg: 'bg-orange-50',  text: 'text-orange-700', dot: 'bg-orange-400' },
  delivered:            { label: 'Livrée',                   bg: 'bg-green-50',   text: 'text-green-700',  dot: 'bg-green-500' },
  cancelled:            { label: 'Annulée',                  bg: 'bg-red-50',     text: 'text-red-700',    dot: 'bg-red-500' },
}

const PAYMENT_OPTIONS = [
  { value: 'mtn_momo', label: 'MTN MoMo' },
  { value: 'moov_money', label: 'Moov Money' },
  { value: 'card', label: 'Carte bancaire' },
  { value: 'cash_on_delivery', label: 'Paiement à la livraison' },
  { value: 'agency', label: 'Agence' },
]

const paymentLabels: Record<string, string> = {
  mtn_momo: 'MTN MoMo',
  moov_money: 'Moov Money',
  card: 'Carte',
  cash_on_delivery: 'À la livraison',
  agency: 'Agence',
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------
function StatusBadge({ status }: { status: string }) {
  const c = statusConfig[status] ?? { label: status, bg: 'bg-gray-50', text: 'text-gray-700', dot: 'bg-gray-400' }
  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap', c.bg, c.text)}>
      <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', c.dot)} />
      {c.label}
    </span>
  )
}

function Spinner() {
  return (
    <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  )
}

function SkeletonRow() {
  return (
    <tr className="border-b border-gray-100">
      {Array.from({ length: 8 }).map((_, i) => (
        <td key={i} className="px-3 py-3">
          <div className="h-4 bg-gray-200 rounded animate-pulse" style={{ width: i === 7 ? '60%' : '85%' }} />
        </td>
      ))}
    </tr>
  )
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------
export default function AdminDeliveriesPage() {
  const [deliveries, setDeliveries] = useState<AdminDelivery[]>([])
  const [meta, setMeta] = useState<PaginationMeta>({ current_page: 1, last_page: 1, total: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [paymentFilter, setPaymentFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  // In-flight action tracking
  const [actionInFlight, setActionInFlight] = useState<string | null>(null)
  // Status edit per delivery
  const [statusEditId, setStatusEditId] = useState<string | null>(null)
  const [statusEditValue, setStatusEditValue] = useState('')

  // Debounce
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [debouncedSearch, setDebouncedSearch] = useState('')

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(search)
      setCurrentPage(1)
    }, 300)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [search])

  const fetchDeliveries = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await getAdminDeliveries({
        page: currentPage,
        search: debouncedSearch,
        status: statusFilter,
        payment_method: paymentFilter,
      })
      setDeliveries(result.data)
      setMeta(result.meta)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement')
    } finally {
      setLoading(false)
    }
  }, [currentPage, debouncedSearch, statusFilter, paymentFilter])

  useEffect(() => { fetchDeliveries() }, [fetchDeliveries])

  const handleValidatePayment = async (id: string) => {
    setActionInFlight(`validate-${id}`)
    try {
      const updated = await validatePayment(id)
      setDeliveries(prev => prev.map(d => (d.id === id ? updated : d)))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur')
    } finally {
      setActionInFlight(null)
    }
  }

  const startStatusEdit = (delivery: AdminDelivery) => {
    setStatusEditId(delivery.id)
    setStatusEditValue(delivery.status)
  }

  const confirmStatusChange = async (id: string) => {
    setActionInFlight(`status-${id}`)
    try {
      const updated = await updateDeliveryStatus(id, statusEditValue)
      setDeliveries(prev => prev.map(d => (d.id === id ? updated : d)))
      setStatusEditId(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur')
    } finally {
      setActionInFlight(null)
    }
  }

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })

  const formatAmount = (amount: number) =>
    amount.toLocaleString('fr-FR') + ' FCFA'

  const truncateId = (id: string) => id.split('-')[0].toUpperCase()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#1D1D1F]">Livraisons</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {meta.total} livraison{meta.total !== 1 ? 's' : ''} au total
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Rechercher un client, livreur…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#861D6D]/30 focus:border-[#861D6D] bg-white"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1) }}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#861D6D]/30 focus:border-[#861D6D] bg-white"
        >
          <option value="">Tous les statuts</option>
          {STATUS_OPTIONS.map(s => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
        <select
          value={paymentFilter}
          onChange={e => { setPaymentFilter(e.target.value); setCurrentPage(1) }}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#861D6D]/30 focus:border-[#861D6D] bg-white"
        >
          <option value="">Tous les modes de paiement</option>
          {PAYMENT_OPTIONS.map(p => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </select>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
          <button onClick={() => setError(null)} className="ml-2 underline">Fermer</button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Client</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Livreur</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Statut</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Méthode</th>
                <th className="px-3 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Montant</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)
              ) : deliveries.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-16 text-center text-gray-400">
                    <div className="flex flex-col items-center gap-2">
                      <svg className="h-10 w-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7H4a2 2 0 00-2 2v6a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z" />
                      </svg>
                      <p className="text-sm font-medium">Aucune livraison trouvée</p>
                      {(search || statusFilter || paymentFilter) && (
                        <button
                          onClick={() => { setSearch(''); setStatusFilter(''); setPaymentFilter('') }}
                          className="text-xs text-[#861D6D] hover:underline"
                        >
                          Effacer les filtres
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                deliveries.map(delivery => (
                  <tr key={delivery.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    {/* ID */}
                    <td className="px-3 py-3">
                      <span className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">
                        {truncateId(delivery.id)}
                      </span>
                    </td>
                    {/* Client */}
                    <td className="px-3 py-3 text-sm text-[#1D1D1F] font-medium">
                      {delivery.client.name}
                    </td>
                    {/* Driver */}
                    <td className="px-3 py-3 text-sm text-gray-500">
                      {delivery.driver ? delivery.driver.name : (
                        <span className="text-gray-300 italic">Non assigné</span>
                      )}
                    </td>
                    {/* Status */}
                    <td className="px-3 py-3">
                      {statusEditId === delivery.id ? (
                        <div className="flex items-center gap-1.5">
                          <select
                            value={statusEditValue}
                            onChange={e => setStatusEditValue(e.target.value)}
                            className="text-xs border border-gray-200 rounded px-1.5 py-1 focus:outline-none focus:ring-1 focus:ring-[#861D6D]"
                          >
                            {STATUS_OPTIONS.map(s => (
                              <option key={s.value} value={s.value}>{s.label}</option>
                            ))}
                          </select>
                          <button
                            onClick={() => confirmStatusChange(delivery.id)}
                            disabled={actionInFlight === `status-${delivery.id}`}
                            className="inline-flex items-center gap-1 px-1.5 py-1 text-xs bg-[#861D6D] text-white rounded disabled:opacity-50"
                          >
                            {actionInFlight === `status-${delivery.id}` ? <Spinner /> : null}
                            OK
                          </button>
                          <button
                            onClick={() => setStatusEditId(null)}
                            className="px-1.5 py-1 text-xs border border-gray-200 rounded hover:bg-gray-50"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <StatusBadge status={delivery.status} />
                      )}
                    </td>
                    {/* Payment method */}
                    <td className="px-3 py-3 text-sm text-gray-600">
                      {paymentLabels[delivery.payment_method] ?? delivery.payment_method}
                    </td>
                    {/* Amount */}
                    <td className="px-3 py-3 text-sm text-right font-medium text-[#1D1D1F] tabular-nums">
                      {formatAmount(delivery.amount_xof)}
                    </td>
                    {/* Date */}
                    <td className="px-3 py-3 text-sm text-gray-500 whitespace-nowrap">
                      {formatDate(delivery.created_at)}
                    </td>
                    {/* Actions */}
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        {delivery.status === 'awaiting_validation' && (
                          <button
                            onClick={() => handleValidatePayment(delivery.id)}
                            disabled={actionInFlight === `validate-${delivery.id}`}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                          >
                            {actionInFlight === `validate-${delivery.id}` ? <Spinner /> : (
                              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                            Valider
                          </button>
                        )}
                        {statusEditId !== delivery.id && (
                          <button
                            onClick={() => startStatusEdit(delivery)}
                            className="text-xs text-[#861D6D] hover:text-[#B24799] font-medium transition-colors whitespace-nowrap"
                          >
                            Changer statut
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && meta.last_page > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50">
            <p className="text-sm text-gray-500">
              Page {meta.current_page} / {meta.last_page}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={meta.current_page <= 1}
                className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                ← Précédent
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.min(meta.last_page, p + 1))}
                disabled={meta.current_page >= meta.last_page}
                className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Suivant →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
