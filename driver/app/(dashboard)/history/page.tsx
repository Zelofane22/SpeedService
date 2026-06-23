'use client'

import { useEffect, useState } from 'react'
import { apiGet } from '@/lib/api-client'

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

const DONE = new Set(['delivered', 'cancelled'])

const STATUS: Record<string, { label: string; color: string }> = {
  delivered:  { label: 'Livrée',   color: 'bg-green-100 text-green-700' },
  cancelled:  { label: 'Annulée',  color: 'bg-red-100 text-red-700' },
  in_delivery:{ label: 'En transit', color: 'bg-blue-100 text-blue-700' },
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
}

function fmtPrice(v: string | number) {
  return Number(v).toLocaleString('fr-FR') + ' FCFA'
}

function short(addr: string) {
  return addr.split(',')[0]?.trim() ?? addr
}

export default function HistoryPage() {
  const [missions, setMissions] = useState<Mission[]>([])
  const [loading, setLoading]   = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    apiGet<Mission[]>('/driver/missions')
      .then((ms) => setMissions(ms.filter((m) => DONE.has(m.status))))
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const total = missions
    .filter((m) => m.status === 'delivered')
    .reduce((sum, m) => sum + Number(m.price), 0)

  return (
    <div className="px-4 pt-4">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700 mb-4">{error}</div>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-[#861D6D] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : missions.length === 0 ? (
        <div className="flex flex-col items-center text-center py-16 gap-3">
          <div className="text-5xl">📋</div>
          <p className="font-semibold text-[#1D1D1F]">Aucune mission terminée</p>
          <p className="text-sm text-gray-500">Vos missions complétées apparaîtront ici.</p>
        </div>
      ) : (
        <>
          {/* Summary card */}
          <div className="bg-[#861D6D] rounded-2xl p-4 mb-4 text-white">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-white/70 text-xs">Missions livrées</p>
                <p className="text-2xl font-bold">{missions.filter((m) => m.status === 'delivered').length}</p>
              </div>
              <div>
                <p className="text-white/70 text-xs">Revenus totaux</p>
                <p className="text-2xl font-bold">{total.toLocaleString('fr-FR')}<span className="text-sm font-normal ml-1">FCFA</span></p>
              </div>
            </div>
          </div>

          {/* Mission list */}
          <div className="flex flex-col gap-2 pb-2">
            {missions.map((m) => {
              const st = STATUS[m.status]
              return (
                <div key={m.id} className="bg-white rounded-xl border border-gray-200 p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <p className="text-xs font-mono font-bold text-[#861D6D]">{m.reference}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{fmtDate(m.created_at)}</p>
                    </div>
                    <div className="text-right flex flex-col items-end gap-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${st?.color ?? 'bg-gray-100 text-gray-600'}`}>
                        {st?.label ?? m.status}
                      </span>
                      <p className="font-bold text-sm text-[#1D1D1F]">{fmtPrice(m.price)}</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">
                    {short(m.pickup_address)} → {short(m.delivery_address)}
                    {m.distance && ` · ${Number(m.distance).toFixed(1)} km`}
                  </p>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
