import { getApiBaseUrl } from '@speedservice/api-client'

const BASE = getApiBaseUrl()

function token(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('driver_token')
}

function headers(): Record<string, string> {
  const t = token()
  return {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(t ? { Authorization: `Bearer ${t}` } : {}),
  }
}

async function handle<T>(res: Response): Promise<T> {
  const data = await res.json()
  if (!res.ok) throw new Error((data as { message?: string }).message ?? 'Erreur serveur')
  return data as T
}

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { headers: headers() })
  return handle<T>(res)
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(body),
  })
  return handle<T>(res)
}

export async function apiPut<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: 'PUT',
    headers: headers(),
    body: JSON.stringify(body),
  })
  return handle<T>(res)
}

export async function apiPatch<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: 'PATCH',
    headers: headers(),
    body: JSON.stringify(body),
  })
  return handle<T>(res)
}

export type DriverUser = {
  id: string
  name: string
  email: string
  phone: string
  role: string
  is_active?: boolean
  is_online?: boolean
}
