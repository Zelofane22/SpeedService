'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { getApplicationStatus } from '@/lib/api'

type Status = {
  status: string
  status_label: string
  rejection_reason?: string
  complement_request?: string
  reviewed_at?: string
  documents: Array<{ type: string; validation_status: string; rejection_note?: string }>
}

const STATUS_CONFIG: Record<string, { icon: string; color: string; bg: string }> = {
  pending:              { icon: '⏳', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
  under_review:         { icon: '🔍', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
  approved:             { icon: '✅', color: 'text-green-700', bg: 'bg-green-50 border-green-200' },
  rejected:             { icon: '❌', color: 'text-red-700', bg: 'bg-red-50 border-red-200' },
  complement_requested: { icon: '📎', color: 'text-orange-700', bg: 'bg-orange-50 border-orange-200' },
}

function StatusContent() {
  const params = useSearchParams()
  const applicationId = params.get('id') ?? ''
  const [status, setStatus] = useState<Status | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [inputId, setInputId] = useState(applicationId)

  const fetch = async (id: string) => {
    if (!id) return
    setLoading(true)
    setError(null)
    try {
      const data = await getApplicationStatus(id)
      setStatus(data)
    } catch {
      setError('Candidature introuvable. Vérifiez votre référence.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (applicationId) fetch(applicationId)
  }, [applicationId])

  const cfg = status ? (STATUS_CONFIG[status.status] ?? STATUS_CONFIG['pending']) : null

  return (
    <div className="min-h-screen bg-[#FAF7FB]">
      <header className="bg-[#861D6D] text-white px-5 py-4 flex items-center gap-3">
        <Link href="/" className="text-white/80 hover:text-white">←</Link>
        <span className="font-semibold flex-1">Suivi de candidature</span>
      </header>

      <div className="p-5 flex flex-col gap-4">
        {!applicationId && (
          <div className="flex flex-col gap-3">
            <label htmlFor="application-reference" className="text-sm font-medium text-gray-700">Référence de candidature</label>
            <input
              id="application-reference"
              name="application-reference"
              required
              autoComplete="off"
              className="w-full border border-gray-200 rounded-lg px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#861D6D]"
              value={inputId}
              onChange={(e) => setInputId(e.target.value)}
              placeholder="Collez votre référence ici"
            />
            <button type="button" onClick={() => fetch(inputId)} disabled={!inputId || loading} aria-busy={loading} className="w-full bg-[#861D6D] disabled:bg-gray-300 text-white py-3 rounded-xl font-semibold">
              {loading ? 'Chargement…' : 'Consulter'}
            </button>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm">{error}</div>
        )}

        {loading && !status && (
          <div className="text-center py-10 text-gray-400">Chargement…</div>
        )}

        {status && cfg && (
          <>
            <div className={`border rounded-xl p-5 flex items-center gap-4 ${cfg.bg}`}>
              <span className="text-3xl">{cfg.icon}</span>
              <div>
                <p className="font-bold text-base text-[#1D1D1F]">{status.status_label}</p>
                {status.reviewed_at && (
                  <p className="text-xs text-gray-500 mt-0.5">
                    Examiné le {new Date(status.reviewed_at).toLocaleDateString('fr-FR')}
                  </p>
                )}
              </div>
            </div>

            {status.rejection_reason && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
                <p className="font-semibold mb-1">Motif de rejet</p>
                <p>{status.rejection_reason}</p>
              </div>
            )}

            {status.complement_request && (
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-sm text-orange-700">
                <p className="font-semibold mb-1">Documents demandés</p>
                <p className="mb-3">{status.complement_request}</p>
                <Link href={`/apply/complement?id=${applicationId || inputId}`} className="inline-block bg-[#861D6D] text-white px-4 py-2 rounded-lg text-sm font-medium">
                  Soumettre les documents →
                </Link>
              </div>
            )}

            {status.status === 'approved' && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                <p className="text-green-700 font-semibold mb-2">Votre compte est actif !</p>
                <Link href="/login" className="inline-block bg-[#861D6D] text-white px-6 py-3 rounded-xl font-semibold">
                  Accéder à mon espace
                </Link>
              </div>
            )}

            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Documents soumis</p>
              <div className="flex flex-col gap-2">
                {status.documents.map((doc, i) => (
                  <div key={i} className="flex items-center justify-between bg-white border border-gray-200 rounded-lg px-4 py-3 text-sm">
                    <span className="text-gray-700">{doc.type}</span>
                    <span className={`text-xs font-medium ${doc.validation_status === 'approved' ? 'text-green-600' : doc.validation_status === 'rejected' ? 'text-red-600' : 'text-amber-600'}`}>
                      {doc.validation_status === 'approved' ? '✓ Validé' : doc.validation_status === 'rejected' ? '✗ Rejeté' : '⏳ En attente'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default function StatusPage() {
  return (
    <Suspense>
      <StatusContent />
    </Suspense>
  )
}
