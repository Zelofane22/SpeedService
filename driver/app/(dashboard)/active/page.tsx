'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { apiGet, apiPatch } from '@/lib/api-client'

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
  sender_name: string
  sender_phone: string
  recipient_name: string
  recipient_phone: string
}

const ACTIVE = new Set(['assigned', 'picking_up', 'in_delivery'])

const STEPS = [
  { status: 'assigned',    label: 'Affectée' },
  { status: 'picking_up',  label: 'Récupération' },
  { status: 'in_delivery', label: 'En transit' },
  { status: 'delivered',   label: 'Livrée' },
]

const NEXT_ACTION: Record<string, { label: string; next: string }> = {
  assigned:    { label: "J'arrive au point d'enlèvement", next: 'picking_up' },
  picking_up:  { label: 'Colis récupéré — Départ pour livraison', next: 'in_delivery' },
  in_delivery: { label: 'Colis livré ✓', next: 'delivered' },
}

function fmtPrice(v: string | number) {
  return Number(v).toLocaleString('fr-FR') + ' FCFA'
}

function short(addr: string) {
  return addr.split(',')[0]?.trim() ?? addr
}

export default function ActiveMissionPage() {
  const router = useRouter()
  const [missions, setMissions] = useState<Mission[]>([])
  const [loading, setLoading]   = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    apiGet<Mission[]>('/driver/missions')
      .then((ms) => setMissions(ms.filter((m) => ACTIVE.has(m.status))))
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  async function advance(m: Mission) {
    const action = NEXT_ACTION[m.status]
    if (!action) return
    setUpdating(m.id)
    setError(null)
    try {
      const updated = await apiPatch<Mission>(`/driver/missions/${m.id}/status`, { status: action.next })
      if (ACTIVE.has(updated.status)) {
        setMissions((ms) => ms.map((x) => x.id === m.id ? updated : x))
      } else {
        setMissions((ms) => ms.filter((x) => x.id !== m.id))
        if (action.next === 'delivered') router.push('/history')
      }
    } catch (e: unknown) {
      setError((e as Error).message ?? 'Erreur de mise à jour.')
    } finally {
      setUpdating(null)
    }
  }

  const statusIdx = (s: string) => STEPS.findIndex((step) => step.status === s)

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-8 h-8 border-4 border-[#861D6D] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (missions.length === 0) {
    return (
      <div className="flex flex-col items-center text-center px-6 py-16 gap-4">
        <div className="text-5xl">📭</div>
        <p className="font-semibold text-[#1D1D1F]">Aucune mission en cours</p>
        <p className="text-sm text-gray-500">Acceptez une mission depuis la liste.</p>
        <button onClick={() => router.push('/missions')} className="bg-[#861D6D] text-white px-6 py-3 rounded-xl font-semibold text-sm">
          Voir les missions →
        </button>
      </div>
    )
  }

  return (
    <div className="px-4 pt-4 flex flex-col gap-4">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">{error}</div>
      )}

      {missions.map((m) => {
        const action = NEXT_ACTION[m.status]
        const current = statusIdx(m.status)
        return (
          <div key={m.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="bg-[#861D6D] px-4 py-3 flex items-center justify-between">
              <div>
                <p className="text-xs text-white/70">Mission</p>
                <p className="text-sm font-bold text-white font-mono">{m.reference}</p>
              </div>
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium bg-white/20 text-white`}>
                {m.delivery_type === 'express' ? 'Express' : 'Standard'}
              </span>
            </div>

            {/* Progress steps */}
            <div className="flex items-center px-4 py-3 gap-1">
              {STEPS.map((step, i) => {
                const done    = i < current
                const active  = i === current
                const future  = i > current
                return (
                  <div key={step.status} className="flex items-center flex-1 last:flex-none">
                    <div className={`flex flex-col items-center gap-1 ${future ? 'opacity-40' : ''}`}>
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${done ? 'bg-green-500 text-white' : active ? 'bg-[#861D6D] text-white ring-4 ring-[#861D6D]/20' : 'bg-gray-100 text-gray-400'}`}>
                        {done ? '✓' : i + 1}
                      </div>
                      <p className="text-[10px] text-gray-500 text-center leading-tight w-12">{step.label}</p>
                    </div>
                    {i < STEPS.length - 1 && (
                      <div className={`flex-1 h-0.5 mx-1 mb-4 ${done ? 'bg-green-400' : 'bg-gray-200'}`} />
                    )}
                  </div>
                )
              })}
            </div>

            {/* Addresses */}
            <div className="px-4 pb-4 space-y-2">
              <div className="bg-[#FAF7FB] rounded-xl p-3">
                <p className="text-xs text-gray-400 mb-0.5">Enlèvement · {m.sender_name}</p>
                <p className="text-sm font-medium text-[#1D1D1F]">{short(m.pickup_address)}</p>
                <a href={`tel:${m.sender_phone}`} className="text-xs text-[#861D6D] mt-1 block">
                  📞 {m.sender_phone}
                </a>
              </div>

              <div className="flex justify-center text-gray-400 text-xs">↓</div>

              <div className="bg-[#FAF7FB] rounded-xl p-3">
                <p className="text-xs text-gray-400 mb-0.5">Livraison · {m.recipient_name}</p>
                <p className="text-sm font-medium text-[#1D1D1F]">{short(m.delivery_address)}</p>
                <a href={`tel:${m.recipient_phone}`} className="text-xs text-[#861D6D] mt-1 block">
                  📞 {m.recipient_phone}
                </a>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-500 px-1 mt-2">
                <span>{m.distance ? `${Number(m.distance).toFixed(1)} km` : '—'}</span>
                <span className="font-bold text-[#861D6D] text-sm">{fmtPrice(m.price)}</span>
              </div>

              {action && (
                <button
                  onClick={() => advance(m)}
                  disabled={updating === m.id}
                  className="w-full bg-[#861D6D] text-white py-4 rounded-xl font-semibold text-sm mt-2 disabled:opacity-60 active:scale-95 transition-transform"
                >
                  {updating === m.id ? 'Mise à jour…' : action.label}
                </button>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
