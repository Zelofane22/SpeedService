const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api'

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
}
