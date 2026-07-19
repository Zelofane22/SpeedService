import type {
  AdminStats,
  AdminReports,
  AdminUser,
  AdminAccount,
  AdminDelivery,
  AdminDriver,
  AdminPayment,
  AdminAlertsResponse,
  AdminActivityLog,
} from '@/types/admin'
import { getApiBaseUrl } from '@speedservice/api-client'

const BASE_URL = getApiBaseUrl()

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

  // 204 No Content (ex. suppression) → pas de corps à parser.
  if (response.status === 204) {
    return undefined as T
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

export function getAdminReports(): Promise<AdminReports> {
  return apiFetch<AdminReports>('/admin/reports')
}

export function getAdminAlerts(): Promise<AdminAlertsResponse> {
  return apiFetch<AdminAlertsResponse>('/admin/alerts')
}

export function getAdminActivityLog(params?: {
  page?: number
  action?: string
}): Promise<{ data: AdminActivityLog[]; current_page: number; last_page: number; total: number }> {
  return apiFetch(`/admin/activity-log${buildQuery(params)}`)
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

// Actions super administrateur ------------------------------------------------

export function resetUserPassword(
  userId: string,
  password: string
): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(`/admin/users/${userId}/password`, {
    method: 'PATCH',
    body: JSON.stringify({ password }),
  })
}

export function deleteUser(userId: string): Promise<void> {
  return apiFetch<void>(`/admin/users/${userId}`, {
    method: 'DELETE',
  })
}

// Gestion des administrateurs (privilège & accès — super admin uniquement) ----

type Paginated<T> = {
  data: T[]
  current_page: number
  last_page: number
  total: number
}

export function getAdmins(params?: {
  page?: number
  search?: string
}): Promise<Paginated<AdminAccount>> {
  return apiFetch<Paginated<AdminAccount>>(`/admin/admins${buildQuery(params)}`)
}

export function createAdmin(payload: {
  name: string
  email: string
  phone?: string
  password: string
  is_super_admin?: boolean
}): Promise<AdminAccount> {
  return apiFetch<AdminAccount>('/admin/admins', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function toggleAdminSuper(adminId: string): Promise<AdminAccount> {
  return apiFetch<AdminAccount>(`/admin/admins/${adminId}/super`, {
    method: 'PATCH',
  })
}

export function revokeAdmin(adminId: string): Promise<{ id: string; role: string }> {
  return apiFetch<{ id: string; role: string }>(`/admin/admins/${adminId}/revoke`, {
    method: 'PATCH',
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
    method: 'POST',
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

// ── Driver applications ───────────────────────────────────────────────────────

export type DriverApplication = {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  city: string
  vehicle_type: string
  status: string
  submitted_at: string | null
  reviewed_at: string | null
  rejection_reason?: string
  complement_request?: string
  documents: Array<{ document_type: string; validation_status: string }>
}

export function getDriverApplications(params?: {
  page?: number
  status?: string
}): Promise<{ data: DriverApplication[]; current_page: number; total: number }> {
  return apiFetch(`/admin/drivers/applications${buildQuery(params)}`)
}

export function getDriverApplication(id: string): Promise<DriverApplication> {
  return apiFetch(`/admin/drivers/applications/${id}`)
}

export function reviewDriverApplication(
  id: string,
  payload: {
    action: 'approve' | 'reject' | 'request_complement'
    rejection_reason?: string
    complement_request?: string
  }
): Promise<{ message: string }> {
  return apiFetch(`/admin/drivers/applications/${id}/review`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}
