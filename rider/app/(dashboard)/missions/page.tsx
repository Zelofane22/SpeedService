'use client'

import { useEffect, useState } from 'react'
import { apiGet, apiPost } from '@/lib/api-client'

type Mission = {
  id: string
  reference: string
  status: string
  pickup_address: string
  delivery_address: string
  price: string
  distance: string | null
  package_type: string
  delivery_type: 'standard' | 'express'
  client: { id: string; name: string; phone: string }
  created_at: string
}

const PKG: Record<string, string> = {
  document: 'Document', small: 'Petit colis', medium: 'Colis moyen', large: 'Grand colis',
}

function fmtPrice(v: string | number) {
  return Number(v).toLocaleString('fr-FR') + ' FCFA'
}

function short(addr: string) {
  return addr.split(',')[0]?.trim() ?? addr
}

export default function MissionsPage() {
  const [missions, setMissions] = useState<Mission[]>([])
  const [declined, setDeclined] = useState<Set<string>>(new Set())
  const [loading, setLoading]   = useState(true)
  const [accepting, setAccepting] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    apiGet<Mission[]>('/driver/missions/available')
      .then(setMissions)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  async function accept(id: string) {
    setAccepting(id)
    setError(null)
    try {
      await apiPost(`/driver/missions/${id}/accept`, {})
      setMissions((ms) => ms.filter((m) => m.id !== id))
    } catch (e: unknown) {
      setError((e as Error).message ?? 'Erreur lors de l\'acceptation.')
    } finally {
      setAccepting(null)
    }
  }

  const visible = missions.filter((m) => !declined.has(m.id))

  return (
    <div className="px-4 pt-4 pb-2">
      <p className="text-sm text-gray-500 mb-3">
        {loading ? 'Chargement…' : `${visible.length} mission${visible.length !== 1 ? 's' : ''} disponible${visible.length !== 1 ? 's' : ''}`}
      </p>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700 mb-4">{error}</div>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-[#861D6D] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : visible.length === 0 ? (
        <div className="flex flex-col items-center text-center py-16 gap-3">
          <div className="text-5xl">🛵</div>
          <p className="font-semibold text-[#1D1D1F]">Aucune mission disponible</p>
          <p className="text-sm text-gray-500">Revenez dans quelques instants.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {visible.map((m) => (
            <div key={m.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-gray-100">
                <div>
                  <p className="text-xs font-mono font-bold text-[#861D6D]">{m.reference}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{m.client?.name} · {m.client?.phone}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-[#861D6D] text-sm">{fmtPrice(m.price)}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${m.delivery_type === 'express' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                    {m.delivery_type === 'express' ? 'Express' : 'Standard'}
                  </span>
                </div>
              </div>

              {/* Route */}
              <div className="px-4 py-3 space-y-2">
                <div className="flex items-start gap-2">
                  <span className="text-[#861D6D] text-xs mt-0.5">📍</span>
                  <div>
                    <p className="text-xs text-gray-400">Enlèvement</p>
                    <p className="text-sm font-medium text-[#1D1D1F]">{short(m.pickup_address)}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-[#B24799] text-xs mt-0.5">🎯</span>
                  <div>
                    <p className="text-xs text-gray-400">Livraison</p>
                    <p className="text-sm font-medium text-[#1D1D1F]">{short(m.delivery_address)}</p>
                  </div>
                </div>
                <p className="text-xs text-gray-400">
                  {PKG[m.package_type] ?? m.package_type}
                  {m.distance && ` · ${Number(m.distance).toFixed(1)} km`}
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-2 px-4 pb-4">
                <button
                  onClick={() => setDeclined((d) => new Set(d).add(m.id))}
                  className="flex-1 border-2 border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-semibold active:scale-95 transition-transform"
                >
                  Refuser
                </button>
                <button
                  onClick={() => accept(m.id)}
                  disabled={accepting === m.id}
                  className="flex-1 bg-[#861D6D] text-white py-2.5 rounded-xl text-sm font-semibold disabled:opacity-60 active:scale-95 transition-transform"
                >
                  {accepting === m.id ? 'Acceptation…' : 'Accepter ✓'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
