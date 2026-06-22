import type {
  AdminStats,
  AdminUser,
  AdminDelivery,
  AdminDriver,
  AdminPayment,
} from '@/types/admin'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api'

function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('auth_token')
}

async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken()
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers ?? {}),
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }))
    throw new Error((error as { message?: string }).message ?? response.statusText)
  }

  return response.json() as Promise<T>
}

function buildQuery(params?: Record<string, string | number | undefined>): string {
  if (!params) return ''
  const filtered = Object.entries(params).filter(([, v]) => v !== undefined)
  if (filtered.length === 0) return ''
  return '?' + new URLSearchParams(filtered.map(([k, v]) => [k, String(v)])).toString()
}

export function getAdminStats(): Promise<AdminStats> {
  return apiFetch<AdminStats>('/admin/stats')
}

export function getAdminUsers(params?: {
  page?: number
  role?: string
  search?: string
}): Promise<{ data: AdminUser[]; meta: unknown }> {
  return apiFetch<{ data: AdminUser[]; meta: unknown }>(
    `/admin/users${buildQuery(params)}`
  )
}

export function updateUserRole(userId: string, role: string): Promise<AdminUser> {
  return apiFetch<AdminUser>(`/admin/users/${userId}/role`, {
    method: 'PATCH',
    body: JSON.stringify({ role }),
  })
}

export function getAdminDeliveries(params?: {
  page?: number
  status?: string
  search?: string
}): Promise<{ data: AdminDelivery[]; meta: unknown }> {
  return apiFetch<{ data: AdminDelivery[]; meta: unknown }>(
    `/admin/deliveries${buildQuery(params)}`
  )
}

export function updateDeliveryStatus(id: string, status: string): Promise<AdminDelivery> {
  return apiFetch<AdminDelivery>(`/admin/deliveries/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  })
}

export function validatePayment(deliveryId: string): Promise<void> {
  return apiFetch<void>(`/admin/deliveries/${deliveryId}/validate-payment`, {
    method: 'PATCH',
  })
}

export function getAdminDrivers(params?: {
  page?: number
  search?: string
}): Promise<{ data: AdminDriver[]; meta: unknown }> {
  return apiFetch<{ data: AdminDriver[]; meta: unknown }>(
    `/admin/drivers${buildQuery(params)}`
  )
}

export function toggleDriverActive(
  driverId: string,
  isActive: boolean
): Promise<AdminDriver> {
  return apiFetch<AdminDriver>(`/admin/drivers/${driverId}/active`, {
    method: 'PATCH',
    body: JSON.stringify({ is_active: isActive }),
  })
}

export function getAdminPayments(params?: {
  page?: number
  status?: string
  search?: string
}): Promise<{ data: AdminPayment[]; meta: unknown }> {
  return apiFetch<{ data: AdminPayment[]; meta: unknown }>(
    `/admin/payments${buildQuery(params)}`
  )
}
