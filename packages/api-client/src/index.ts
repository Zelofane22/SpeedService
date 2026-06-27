declare const process: { env: { NEXT_PUBLIC_API_URL?: string } }

const DEFAULT_API_URL = 'http://localhost:8000/api'

function hasApiSegment(pathname: string): boolean {
  return pathname.split('/').filter(Boolean).includes('api')
}

function envApiUrl(): string | undefined {
  return typeof process === 'undefined' ? undefined : process.env.NEXT_PUBLIC_API_URL
}

export function getApiBaseUrl(value = envApiUrl()): string {
  const raw = (value?.trim() || DEFAULT_API_URL).replace(/\/+$/, '')

  if (raw.startsWith('/')) {
    return hasApiSegment(raw) ? raw : `${raw}/api`
  }

  const hasProtocol = /^[a-z][a-z\d+\-.]*:\/\//i.test(raw)
  const startsWithLocalHost = /^(localhost|127\.|0\.0\.0\.0|\[::1\])(?::|\/|$)/i.test(raw)
  const base = hasProtocol ? raw : `${startsWithLocalHost ? 'http' : 'https'}://${raw}`
  const url = new URL(base)

  if (!hasApiSegment(url.pathname)) {
    url.pathname = `${url.pathname.replace(/\/+$/, '')}/api`
  }

  return url.toString().replace(/\/+$/, '')
}

const BASE_URL = getApiBaseUrl()

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

async function readJson<T>(res: Response): Promise<T> {
  const text = await res.text()
  if (!text) {
    if (!res.ok) {
      return { message: res.statusText || 'Une erreur est survenue' } as T
    }

    return undefined as T
  }

  try {
    return JSON.parse(text) as T
  } catch {
    throw new Error(
      `Réponse API invalide (${res.status}). Vérifiez NEXT_PUBLIC_API_URL.`,
    )
  }
}

function apiUrl(path: string): string {
  return `${BASE_URL}${path.startsWith('/') ? path : `/${path}`}`
}

export async function apiGet<T>(path: string, tokenKey = 'auth_token'): Promise<T> {
  const res = await fetch(apiUrl(path), {
    method: 'GET',
    headers: { Accept: 'application/json', ...authHeaders(tokenKey) },
  })
  const data = await readJson<T | ApiError>(res)
  if (!res.ok) throw buildError(data as ApiError)
  return data as T
}

export async function apiPost<T>(
  path: string,
  body: unknown,
  authenticated = false,
  tokenKey = 'auth_token'
): Promise<T> {
  const res = await fetch(apiUrl(path), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(authenticated ? authHeaders(tokenKey) : {}),
    },
    body: JSON.stringify(body),
  })
  const data = await readJson<T | ApiError>(res)
  if (!res.ok) throw buildError(data as ApiError)
  return data as T
}

export async function apiPut<T>(path: string, body: unknown, tokenKey = 'auth_token'): Promise<T> {
  const res = await fetch(apiUrl(path), {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...authHeaders(tokenKey),
    },
    body: JSON.stringify(body),
  })
  const data = await readJson<T | ApiError>(res)
  if (!res.ok) throw buildError(data as ApiError)
  return data as T
}

export async function apiPatch<T>(
  path: string,
  body: unknown,
  authenticated = false,
  tokenKey = 'auth_token'
): Promise<T> {
  const res = await fetch(apiUrl(path), {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(authenticated ? authHeaders(tokenKey) : {}),
    },
    body: JSON.stringify(body),
  })
  const data = await readJson<T | ApiError>(res)
  if (!res.ok) throw buildError(data as ApiError)
  return data as T
}

export async function apiDelete(path: string, tokenKey = 'auth_token'): Promise<void> {
  const res = await fetch(apiUrl(path), {
    method: 'DELETE',
    headers: { Accept: 'application/json', ...authHeaders(tokenKey) },
  })
  if (!res.ok && res.status !== 204) {
    const data = await readJson<ApiError>(res)
    throw buildError(data as ApiError)
  }
}
