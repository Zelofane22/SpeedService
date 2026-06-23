const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api'

export async function applyRider(data: Record<string, string>) {
  const res = await fetch(`${BASE}/rider/apply`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw await res.json()
  return res.json() as Promise<{ application_id: string; message: string }>
}

export async function uploadDocuments(formData: FormData) {
  const res = await fetch(`${BASE}/rider/apply/documents`, {
    method: 'POST',
    headers: { Accept: 'application/json' },
    body: formData,
  })
  if (!res.ok) throw await res.json()
  return res.json()
}

export async function getApplicationStatus(applicationId: string) {
  const res = await fetch(`${BASE}/rider/apply/status?application_id=${applicationId}`, {
    headers: { Accept: 'application/json' },
  })
  if (!res.ok) throw await res.json()
  return res.json()
}

export async function submitComplement(formData: FormData) {
  const res = await fetch(`${BASE}/rider/apply/complement`, {
    method: 'POST',
    headers: { Accept: 'application/json' },
    body: formData,
  })
  if (!res.ok) throw await res.json()
  return res.json()
}
