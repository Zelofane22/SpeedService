import type {
  AdminStats,
  AdminUser,
  AdminDelivery,
  AdminDriver,
  AdminReport,
} from '@/types/admin'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api'

function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('auth_token')
}

function authHeaders(): Record<string, string> {
  const token = getToken()
  return {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json()
  if (!res.ok) {
    const message = (data as { message?: string }).message ?? 'Une erreur est survenue'
    throw Object.assign(new Error(message), { errors: (data as { errors?: unknown }).errors })
  }
  return data as T
}

function buildQuery(params: Record<string, string | number | undefined>): string {
  const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== '')
  if (entries.length === 0) return ''
  return '?' + entries.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`).join('&')
}

export async function getAdminStats(): Promise<AdminStats> {
  const res = await fetch(`${BASE_URL}/admin/stats`, { headers: authHeaders() })
  return handleResponse<AdminStats>(res)
}

export async function getAdminUsers(params?: {
  page?: number
  role?: string
  search?: string
}): Promise<{ data: AdminUser[]; meta: unknown }> {
  const qs = buildQuery(params ?? {})
  const res = await fetch(`${BASE_URL}/admin/users${qs}`, { headers: authHeaders() })
  return handleResponse<{ data: AdminUser[]; meta: unknown }>(res)
}

export async function updateUserRole(userId: string, role: string): Promise<AdminUser> {
  const res = await fetch(`${BASE_URL}/admin/users/${userId}/role`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify({ role }),
  })
  return handleResponse<AdminUser>(res)
}

export async function getAdminDeliveries(params?: {
  page?: number
  status?: string
  search?: string
}): Promise<{ data: AdminDelivery[]; meta: unknown }> {
  const qs = buildQuery(params ?? {})
  const res = await fetch(`${BASE_URL}/admin/deliveries${qs}`, { headers: authHeaders() })
  return handleResponse<{ data: AdminDelivery[]; meta: unknown }>(res)
}

export async function updateDeliveryStatus(id: string, status: string): Promise<AdminDelivery> {
  const res = await fetch(`${BASE_URL}/admin/deliveries/${id}/status`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify({ status }),
  })
  return handleResponse<AdminDelivery>(res)
}

export async function validatePayment(id: string): Promise<AdminDelivery> {
  const res = await fetch(`${BASE_URL}/admin/deliveries/${id}/validate-payment`, {
    method: 'POST',
    headers: authHeaders(),
  })
  return handleResponse<AdminDelivery>(res)
}

export async function getAdminDrivers(params?: {
  page?: number
}): Promise<{ data: AdminDriver[]; meta: unknown }> {
  const qs = buildQuery(params ?? {})
  const res = await fetch(`${BASE_URL}/admin/drivers${qs}`, { headers: authHeaders() })
  return handleResponse<{ data: AdminDriver[]; meta: unknown }>(res)
}

export async function toggleDriverStatus(id: string): Promise<AdminDriver> {
  const res = await fetch(`${BASE_URL}/admin/drivers/${id}/toggle-status`, {
    method: 'PATCH',
    headers: authHeaders(),
  })
  return handleResponse<AdminDriver>(res)
}

export async function getAdminReports(): Promise<AdminReport> {
  const res = await fetch(`${BASE_URL}/admin/reports`, { headers: authHeaders() })
  return handleResponse<AdminReport>(res)
}
