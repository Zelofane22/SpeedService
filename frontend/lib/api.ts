const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api'

type ApiError = {
  message: string
  errors?: Record<string, string[]>
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(body),
  })

  const data = await res.json()

  if (!res.ok) {
    const err = data as ApiError
    throw Object.assign(new Error(err.message ?? 'Une erreur est survenue'), {
      status: res.status,
      errors: err.errors,
    })
  }

  return data as T
}
