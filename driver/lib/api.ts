import { getApiBaseUrl } from '@speedservice/api-client'

const BASE = getApiBaseUrl()

export async function applyDriver(data: Record<string, string>) {
  const res = await fetch(`${BASE}/driver/apply`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw await res.json()
  return res.json() as Promise<{ application_id: string; message: string }>
}

export async function uploadDocuments(formData: FormData) {
  const res = await fetch(`${BASE}/driver/apply/documents`, {
    method: 'POST',
    headers: { Accept: 'application/json' },
    body: formData,
  })
  if (!res.ok) throw await res.json()
  return res.json()
}

export async function getApplicationStatus(applicationId: string) {
  const res = await fetch(`${BASE}/driver/apply/status?application_id=${applicationId}`, {
    headers: { Accept: 'application/json' },
  })
  if (!res.ok) throw await res.json()
  return res.json()
}

export async function submitComplement(formData: FormData) {
  const res = await fetch(`${BASE}/driver/apply/complement`, {
    method: 'POST',
    headers: { Accept: 'application/json' },
    body: formData,
  })
  if (!res.ok) throw await res.json()
  return res.json()
}
