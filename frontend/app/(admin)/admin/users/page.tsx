'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Type definitions (mirrors types/admin.ts — inline fallback)
// ---------------------------------------------------------------------------
interface AdminUser {
  id: string
  name: string
  email: string
  role: string
  created_at: string
  deliveries_count: number
}

interface PaginationMeta {
  current_page: number
  last_page: number
  total: number
}

// ---------------------------------------------------------------------------
// API helpers (mirrors lib/api/admin.ts — inline fallback)
// ---------------------------------------------------------------------------
const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api'

function authHeaders(): Record<string, string> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
  return token ? { Authorization: `Bearer ${token}` } : {}
}

let getAdminUsers: (params: {
  page?: number
  search?: string
  role?: string
}) => Promise<{ data: AdminUser[]; meta: PaginationMeta }>

let updateUserRole: (id: string, role: string) => Promise<AdminUser>

try {
  // Try to import from the shared module (created by the infrastructure agent)
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const adminApi = require('@/lib/api/admin')
  getAdminUsers = adminApi.getAdminUsers
  updateUserRole = adminApi.updateUserRole
} catch {
  // Fallback implementations
  getAdminUsers = async ({ page = 1, search = '', role = '' }) => {
    const params = new URLSearchParams({ page: String(page) })
    if (search) params.set('search', search)
    if (role) params.set('role', role)
    const res = await fetch(`${BASE_URL}/admin/users?${params}`, {
      headers: { Accept: 'application/json', ...authHeaders() },
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message ?? 'Erreur')
    return data
  }
  updateUserRole = async (id: string, role: string) => {
    const res = await fetch(`${BASE_URL}/admin/users/${id}/role`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json', ...authHeaders() },
      body: JSON.stringify({ role }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message ?? 'Erreur')
    return data
  }
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------
const ROLES = ['client', 'driver', 'admin']

const roleLabels: Record<string, string> = {
  client: 'Client',
  driver: 'Livreur',
  admin: 'Admin',
}

const roleBadgeClass: Record<string, string> = {
  client: 'bg-blue-50 text-blue-700',
  driver: 'bg-amber-50 text-amber-700',
  admin: 'bg-purple-50 text-purple-700',
}

function RoleBadge({ role }: { role: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold',
        roleBadgeClass[role] ?? 'bg-gray-50 text-gray-700'
      )}
    >
      {roleLabels[role] ?? role}
    </span>
  )
}

function SkeletonRow() {
  return (
    <tr className="border-b border-gray-100">
      {Array.from({ length: 6 }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 bg-gray-200 rounded animate-pulse" style={{ width: i === 0 ? '60%' : i === 5 ? '40%' : '80%' }} />
        </td>
      ))}
    </tr>
  )
}

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------
export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [meta, setMeta] = useState<PaginationMeta>({ current_page: 1, last_page: 1, total: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  // Role editing state
  const [editingUserId, setEditingUserId] = useState<string | null>(null)
  const [editingRole, setEditingRole] = useState('')
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  // Debounce ref
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [debouncedSearch, setDebouncedSearch] = useState('')

  // Debounce search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(search)
      setCurrentPage(1)
    }, 300)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [search])

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await getAdminUsers({ page: currentPage, search: debouncedSearch, role: roleFilter })
      setUsers(result.data)
      setMeta(result.meta)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement')
    } finally {
      setLoading(false)
    }
  }, [currentPage, debouncedSearch, roleFilter])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const handleRoleFilterChange = (value: string) => {
    setRoleFilter(value)
    setCurrentPage(1)
  }

  const startEditRole = (user: AdminUser) => {
    setEditingUserId(user.id)
    setEditingRole(user.role)
  }

  const cancelEditRole = () => {
    setEditingUserId(null)
    setEditingRole('')
  }

  const confirmRoleChange = async (userId: string) => {
    setUpdatingId(userId)
    try {
      const updated = await updateUserRole(userId, editingRole)
      setUsers(prev => prev.map(u => (u.id === userId ? updated : u)))
      setEditingUserId(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour')
    } finally {
      setUpdatingId(null)
    }
  }

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1D1D1F]">Utilisateurs</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {meta.total} utilisateur{meta.total !== 1 ? 's' : ''} au total
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
        <select
          value={roleFilter}
          onChange={e => handleRoleFilterChange(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#861D6D]/30 focus:border-[#861D6D] bg-white"
        >
          <option value="">Tous les rôles</option>
          <option value="client">Client</option>
          <option value="driver">Livreur</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
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
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Rôle</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Livraisons</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Inscription</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-16 text-center text-gray-400">
                    <div className="flex flex-col items-center gap-2">
                      <svg className="h-10 w-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2h5M12 11a4 4 0 100-8 4 4 0 000 8z" />
                      </svg>
                      <p className="text-sm font-medium">Aucun utilisateur trouvé</p>
                      {(search || roleFilter) && (
                        <button
                          onClick={() => { setSearch(''); setRoleFilter('') }}
                          className="text-xs text-[#861D6D] hover:underline"
                        >
                          Effacer les filtres
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                users.map(user => (
                  <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-full bg-[#861D6D]/10 flex items-center justify-center text-[#861D6D] text-xs font-bold flex-shrink-0">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-medium text-[#1D1D1F]">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{user.email}</td>
                    <td className="px-4 py-3">
                      {editingUserId === user.id ? (
                        <div className="flex items-center gap-2">
                          <select
                            value={editingRole}
                            onChange={e => setEditingRole(e.target.value)}
                            className="text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#861D6D]"
                          >
                            {ROLES.map(r => (
                              <option key={r} value={r}>{roleLabels[r]}</option>
                            ))}
                          </select>
                          <button
                            onClick={() => confirmRoleChange(user.id)}
                            disabled={updatingId === user.id}
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-[#861D6D] text-white rounded hover:bg-[#861D6D]/90 disabled:opacity-50"
                          >
                            {updatingId === user.id ? <Spinner /> : null}
                            OK
                          </button>
                          <button
                            onClick={cancelEditRole}
                            disabled={updatingId === user.id}
                            className="px-2 py-1 text-xs border border-gray-200 rounded hover:bg-gray-50"
                          >
                            Annuler
                          </button>
                        </div>
                      ) : (
                        <RoleBadge role={user.role} />
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 tabular-nums">
                      {user.deliveries_count}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{formatDate(user.created_at)}</td>
                    <td className="px-4 py-3">
                      {editingUserId !== user.id && (
                        <button
                          onClick={() => startEditRole(user)}
                          className="text-xs text-[#861D6D] hover:text-[#B24799] font-medium transition-colors"
                        >
                          Changer le rôle
                        </button>
                      )}
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
