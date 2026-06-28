'use client'

import { useState, useEffect } from 'react'
import { getApiBaseUrl } from '@speedservice/api-client'

type DriverApplication = {
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

const BASE_URL = getApiBaseUrl()

function authHeaders(): Record<string, string> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
  return {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

const STATUS_LABELS: Record<string, { label: string; cls: string }> = {
  pending:              { label: 'En attente',         cls: 'bg-amber-100 text-amber-800' },
  under_review:         { label: "En cours d'examen",  cls: 'bg-blue-100 text-blue-800' },
  approved:             { label: 'Approuvée',           cls: 'bg-green-100 text-green-800' },
  rejected:             { label: 'Rejetée',             cls: 'bg-red-100 text-red-800' },
  complement_requested: { label: 'Complément demandé',  cls: 'bg-orange-100 text-orange-800' },
}

const VEHICLE_ICONS: Record<string, string> = {
  bicycle: '🚲', motorcycle: '🛵', car: '🚗', van: '🚐',
}

export default function DriverApplicationsPage() {
  // null = loading, [] | DriverApplication[] = loaded
  const [applications, setApplications] = useState<DriverApplication[] | null>(null)
  const [filterStatus, setFilterStatus] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)
  const [selected, setSelected] = useState<DriverApplication | null>(null)
  const [action, setAction] = useState<'approve' | 'reject' | 'request_complement' | null>(null)
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let cancelled = false
    const qs = filterStatus ? `?status=${filterStatus}` : ''
    fetch(`${BASE_URL}/admin/drivers/applications${qs}`, { headers: authHeaders() })
      .then((r) => r.json())
      .then((json) => { if (!cancelled) setApplications(json.data ?? []) })
      .catch(() => { if (!cancelled) setApplications([]) })
    return () => { cancelled = true }
  }, [filterStatus, refreshKey])

  const applyFilter = (status: string) => {
    setApplications(null)
    setFilterStatus(status)
  }

  const refresh = () => {
    setApplications(null)
    setRefreshKey((k) => k + 1)
  }

  const openDetail = async (id: string) => {
    const res = await fetch(`${BASE_URL}/admin/drivers/applications/${id}`, { headers: authHeaders() })
    const json = await res.json()
    setSelected(json as DriverApplication)
    setAction(null)
    setReason('')
  }

  const submitDecision = async () => {
    if (!selected || !action) return
    setSubmitting(true)
    try {
      const body: Record<string, string> = { action }
      if (action === 'reject') body['rejection_reason'] = reason
      if (action === 'request_complement') body['complement_request'] = reason

      await fetch(`${BASE_URL}/admin/drivers/applications/${selected.id}/review`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify(body),
      })
      setSelected(null)
      refresh()
    } finally {
      setSubmitting(false)
    }
  }

  const loading = applications === null

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Candidatures livreurs</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Validation des dossiers d&apos;inscription</p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {['', 'pending', 'under_review', 'approved', 'rejected', 'complement_requested'].map((s) => (
          <button
            key={s}
            onClick={() => applyFilter(s)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              filterStatus === s
                ? 'bg-primary text-white border-primary'
                : 'border-border text-muted-foreground hover:border-primary hover:text-foreground'
            }`}
          >
            {s === '' ? 'Tous' : (STATUS_LABELS[s]?.label ?? s)}
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Chargement…</div>
      ) : applications.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">Aucune candidature</div>
      ) : (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Candidat</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Véhicule</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Ville</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Statut</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Soumis le</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {applications.map((app) => {
                const st = STATUS_LABELS[app.status]
                return (
                  <tr key={app.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground">{app.first_name} {app.last_name}</p>
                      <p className="text-xs text-muted-foreground">{app.email}</p>
                    </td>
                    <td className="px-4 py-3 text-foreground">
                      {VEHICLE_ICONS[app.vehicle_type] ?? '🚗'} {app.vehicle_type}
                    </td>
                    <td className="px-4 py-3 text-foreground">{app.city}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${st?.cls ?? 'bg-muted text-muted-foreground'}`}>
                        {st?.label ?? app.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {app.submitted_at ? new Date(app.submitted_at).toLocaleDateString('fr-FR') : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => openDetail(app.id)}
                        className="text-primary font-medium text-xs hover:underline"
                      >
                        Examiner →
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          </div>
        </div>
      )}

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h2 className="font-bold text-lg text-foreground">{selected.first_name} {selected.last_name}</h2>
              <button onClick={() => setSelected(null)} className="text-muted-foreground hover:text-foreground text-xl">✕</button>
            </div>

            <div className="p-5 flex flex-col gap-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                {[
                  ['Email', selected.email],
                  ['Téléphone', selected.phone],
                  ['Ville', selected.city],
                  ['Véhicule', `${VEHICLE_ICONS[selected.vehicle_type] ?? ''} ${selected.vehicle_type}`],
                ].map(([k, v]) => (
                  <div key={k}>
                    <p className="text-xs text-muted-foreground">{k}</p>
                    <p className="font-medium text-foreground">{v}</p>
                  </div>
                ))}
              </div>

              {/* Documents */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Documents</p>
                <div className="flex flex-col gap-1">
                  {selected.documents.map((d, i) => (
                    <div key={i} className="flex justify-between text-xs">
                      <span className="text-muted-foreground">{d.document_type}</span>
                      <span className={
                        d.validation_status === 'approved' ? 'text-green-600' :
                        d.validation_status === 'rejected' ? 'text-red-600' : 'text-amber-600'
                      }>
                        {d.validation_status}
                      </span>
                    </div>
                  ))}
                  {selected.documents.length === 0 && (
                    <p className="text-xs text-muted-foreground italic">Aucun document soumis</p>
                  )}
                </div>
              </div>

              {/* Decision */}
              {['pending', 'under_review', 'complement_requested'].includes(selected.status) && (
                <div className="border-t border-border pt-4">
                  <p className="text-xs font-semibold text-muted-foreground uppercase mb-3">Décision</p>
                  <div className="flex gap-2 mb-3">
                    {([
                      { value: 'approve', label: '✓ Approuver', cls: 'bg-green-600 text-white' },
                      { value: 'reject', label: '✗ Rejeter', cls: 'bg-red-600 text-white' },
                      { value: 'request_complement', label: '📎 Complément', cls: 'bg-orange-500 text-white' },
                    ] as const).map(({ value, label, cls }) => (
                      <button
                        key={value}
                        onClick={() => { setAction(value); setReason('') }}
                        className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${
                          action === value ? cls : 'border border-border text-muted-foreground hover:border-foreground'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>

                  {(action === 'reject' || action === 'request_complement') && (
                    <textarea
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      className="w-full border border-border rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                      rows={3}
                      placeholder={action === 'reject' ? 'Motif de rejet…' : 'Documents manquants à demander…'}
                    />
                  )}

                  <button
                    disabled={!action || submitting || ((action === 'reject' || action === 'request_complement') && !reason)}
                    onClick={submitDecision}
                    className="w-full bg-primary disabled:bg-muted text-white disabled:text-muted-foreground py-3 rounded-xl font-semibold mt-3 transition-colors"
                  >
                    {submitting ? 'Enregistrement…' : 'Confirmer la décision'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
