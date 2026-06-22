'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Type definitions
// ---------------------------------------------------------------------------
interface AdminDriver {
  id: string
  name: string
  email: string
  is_active: boolean
  deliveries_completed: number
  created_at: string
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

let getAdminDrivers: (params: {
  page?: number
  search?: string
}) => Promise<{ data: AdminDriver[]; meta: PaginationMeta }>

let toggleDriverStatus: (id: string) => Promise<AdminDriver>

try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const adminApi = require('@/lib/api/admin')
  getAdminDrivers = adminApi.getAdminDrivers
  toggleDriverStatus = adminApi.toggleDriverStatus
} catch {
  getAdminDrivers = async ({ page = 1, search = '' }) => {
    const params = new URLSearchParams({ page: String(page) })
    if (search) params.set('search', search)
    const res = await fetch(`${BASE_URL}/admin/drivers?${params}`, {
      headers: { Accept: 'application/json', ...authHeaders() },
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message ?? 'Erreur')
    return data
  }
  toggleDriverStatus = async (id: string) => {
    const res = await fetch(`${BASE_URL}/admin/drivers/${id}/toggle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json', ...authHeaders() },
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message ?? 'Erreur')
    return data
  }
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------
function Spinner({ small = false }: { small?: boolean }) {
  return (
    <svg
      className={cn('animate-spin', small ? 'h-3.5 w-3.5' : 'h-4 w-4')}
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  )
}

function SkeletonRow() {
  return (
    <tr className="border-b border-gray-100">
      {Array.from({ length: 6 }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div
            className="h-4 bg-gray-200 rounded animate-pulse"
            style={{ width: i === 3 ? '60px' : i === 5 ? '50%' : '80%' }}
          />
        </td>
      ))}
    </tr>
  )
}

// Active toggle switch component
function ActiveToggle({
  active,
  loading,
  onToggle,
}: {
  active: boolean
  loading: boolean
  onToggle: () => void
}) {
  return (
    <button
      onClick={onToggle}
      disabled={loading}
      aria-label={active ? 'Désactiver le livreur' : 'Activer le livreur'}
      className={cn(
        'relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#861D6D]/30',
        active ? 'bg-[#861D6D]' : 'bg-gray-200',
        loading && 'opacity-60 cursor-wait'
      )}
    >
      <span
        className={cn(
          'pointer-events-none inline-flex h-4 w-4 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out items-center justify-center',
          active ? 'translate-x-4' : 'translate-x-0'
        )}
      >
        {loading && <Spinner small />}
      </span>
    </button>
  )
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------
export default function AdminDriversPage() {
  const [drivers, setDrivers] = useState<AdminDriver[]>([])
  const [meta, setMeta] = useState<PaginationMeta>({ current_page: 1, last_page: 1, total: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [togglingId, setTogglingId] = useState<string | null>(null)

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

  const fetchDrivers = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await getAdminDrivers({ page: currentPage, search: debouncedSearch })
      setDrivers(result.data)
      setMeta(result.meta)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement')
    } finally {
      setLoading(false)
    }
  }, [currentPage, debouncedSearch])

  useEffect(() => { fetchDrivers() }, [fetchDrivers])

  const handleToggle = async (driver: AdminDriver) => {
    setTogglingId(driver.id)
    // Optimistic update
    setDrivers(prev =>
      prev.map(d => (d.id === driver.id ? { ...d, is_active: !d.is_active } : d))
    )
    try {
      const updated = await toggleDriverStatus(driver.id)
      setDrivers(prev => prev.map(d => (d.id === driver.id ? updated : d)))
    } catch (err) {
      // Revert on error
      setDrivers(prev =>
        prev.map(d => (d.id === driver.id ? { ...d, is_active: driver.is_active } : d))
      )
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour')
    } finally {
      setTogglingId(null)
    }
  }

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })

  const activeCount = drivers.filter(d => d.is_active).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1D1D1F]">Livreurs</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {meta.total} livreur{meta.total !== 1 ? 's' : ''} au total
            {!loading && (
              <span className="ml-2 text-green-600 font-medium">
                · {activeCount} actif{activeCount !== 1 ? 's' : ''}
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Rechercher par nom ou email…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#861D6D]/30 focus:border-[#861D6D] bg-white"
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Nom</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Livraisons</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Statut</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Inscription</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)
              ) : drivers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-16 text-center text-gray-400">
                    <div className="flex flex-col items-center gap-2">
                      <svg className="h-10 w-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <p className="text-sm font-medium">Aucun livreur trouvé</p>
                      {search && (
                        <button
                          onClick={() => setSearch('')}
                          className="text-xs text-[#861D6D] hover:underline"
                        >
                          Effacer la recherche
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                drivers.map(driver => (
                  <tr key={driver.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    {/* Name */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 text-xs font-bold flex-shrink-0">
                          {driver.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-medium text-[#1D1D1F]">{driver.name}</span>
                      </div>
                    </td>
                    {/* Email */}
                    <td className="px-4 py-3 text-sm text-gray-600">{driver.email}</td>
                    {/* Deliveries */}
                    <td className="px-4 py-3 text-sm text-gray-600 text-right tabular-nums font-medium">
                      {driver.deliveries_completed}
                    </td>
                    {/* Active status */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <ActiveToggle
                          active={driver.is_active}
                          loading={togglingId === driver.id}
                          onToggle={() => handleToggle(driver)}
                        />
                        <span className={cn(
                          'text-xs font-medium',
                          driver.is_active ? 'text-green-600' : 'text-gray-400'
                        )}>
                          {driver.is_active ? 'Actif' : 'Inactif'}
                        </span>
                      </div>
                    </td>
                    {/* Join date */}
                    <td className="px-4 py-3 text-sm text-gray-500">{formatDate(driver.created_at)}</td>
                    {/* Actions */}
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleToggle(driver)}
                        disabled={togglingId === driver.id}
                        className={cn(
                          'inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-lg font-medium transition-colors disabled:opacity-50',
                          driver.is_active
                            ? 'bg-red-50 text-red-700 hover:bg-red-100'
                            : 'bg-green-50 text-green-700 hover:bg-green-100'
                        )}
                      >
                        {togglingId === driver.id ? (
                          <Spinner small />
                        ) : (
                          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d={driver.is_active
                                ? 'M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636'
                                : 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
                              }
                            />
                          </svg>
                        )}
                        {driver.is_active ? 'Désactiver' : 'Activer'}
                      </button>
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
