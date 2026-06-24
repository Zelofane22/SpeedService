const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api'

type ApiError = {
  message: string
  errors?: Record<string, string[]>
}

function authHeaders(tokenKey = 'auth_token'): Record<string, string> {
  const token = typeof window !== 'undefined' ? localStorage.getItem(tokenKey) : null
  return token ? { Authorization: `Bearer ${token}` } : {}
}

function buildError(data: ApiError): Error {
  return Object.assign(new Error(data.message ?? 'Une erreur est survenue'), {
    errors: data.errors,
  })
}

export async function apiGet<T>(path: string, tokenKey = 'auth_token'): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'GET',
    headers: { Accept: 'application/json', ...authHeaders(tokenKey) },
  })
  const data = await res.json()
  if (!res.ok) throw buildError(data as ApiError)
  return data as T
}

export async function apiPost<T>(
  path: string,
  body: unknown,
  authenticated = false,
  tokenKey = 'auth_token'
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(authenticated ? authHeaders(tokenKey) : {}),
    },
    body: JSON.stringify(body),
  })
  const data = await res.json()
  if (!res.ok) throw buildError(data as ApiError)
  return data as T
}

export async function apiPut<T>(path: string, body: unknown, tokenKey = 'auth_token'): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...authHeaders(tokenKey),
    },
    body: JSON.stringify(body),
  })
  const data = await res.json()
  if (!res.ok) throw buildError(data as ApiError)
  return data as T
}

export async function apiPatch<T>(
  path: string,
  body: unknown,
  authenticated = false,
  tokenKey = 'auth_token'
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(authenticated ? authHeaders(tokenKey) : {}),
    },
    body: JSON.stringify(body),
  })
  const data = await res.json()
  if (!res.ok) throw buildError(data as ApiError)
  return data as T
}

export async function apiDelete(path: string, tokenKey = 'auth_token'): Promise<void> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'DELETE',
    headers: { Accept: 'application/json', ...authHeaders(tokenKey) },
  })
  if (!res.ok && res.status !== 204) {
    const data = await res.json()
    throw buildError(data as ApiError)
  }
}
