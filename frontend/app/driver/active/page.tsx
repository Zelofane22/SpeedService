'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { MapPin, Package, Phone, ChevronRight, CheckCircle, Loader2 } from 'lucide-react'
import { apiGet, apiPatch } from '@/lib/api'
import { cn } from '@/lib/utils'

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

const ACTIVE_STATUSES = new Set(['assigned', 'picking_up', 'in_delivery'])

const STATUS_LABELS: Record<string, string> = {
  assigned:    'Affectée — En route vers l\'enlèvement',
  picking_up:  'En cours de récupération',
  in_delivery: 'En transit vers la destination',
}

const NEXT_ACTION: Record<string, { label: string; next: string }> = {
  assigned:    { label: 'J\'arrive au point d\'enlèvement', next: 'picking_up' },
  picking_up:  { label: 'Colis récupéré — Départ pour livraison', next: 'in_delivery' },
  in_delivery: { label: 'Colis livré', next: 'delivered' },
}

function fmtPrice(v: string | number) {
  return Number(v).toLocaleString('fr-FR') + ' FCFA'
}

function shortAddr(addr: string) {
  return addr.split(',')[0]?.trim() ?? addr
}

export default function ActiveMissionPage() {
  const router  = useRouter()
  const [missions, setMissions] = useState<Mission[]>([])
  const [loading, setLoading]   = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const [error, setError]       = useState<string | null>(null)

  useEffect(() => {
    apiGet<Mission[]>('/driver/missions')
      .then((ms) => setMissions(ms.filter((m) => ACTIVE_STATUSES.has(m.status))))
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  async function handleAdvance(mission: Mission) {
    const action = NEXT_ACTION[mission.status]
    if (!action) return

    setUpdating(mission.id)
    setError(null)
    try {
      const updated = await apiPatch<Mission>(`/driver/missions/${mission.id}/status`, { status: action.next }, true)
      if (ACTIVE_STATUSES.has(updated.status)) {
        setMissions((prev) => prev.map((m) => m.id === mission.id ? updated : m))
      } else {
        setMissions((prev) => prev.filter((m) => m.id !== mission.id))
        if (action.next === 'delivered') router.push('/driver/history')
      }
    } catch (e: unknown) {
      setError((e as Error).message ?? 'Erreur lors de la mise à jour.')
    } finally {
      setUpdating(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 size={32} className="text-primary animate-spin" />
      </div>
    )
  }

  if (missions.length === 0) {
    return (
      <div className="p-6 flex flex-col items-center justify-center py-24 text-center">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
          <Package size={32} className="text-primary" />
        </div>
        <h3 className="text-base font-semibold text-brand-foreground mb-1">Aucune mission en cours</h3>
        <p className="text-sm text-gray-700 mb-5">Acceptez une mission depuis la liste des missions disponibles.</p>
        <button
          onClick={() => router.push('/driver/missions')}
          className="px-6 py-3 bg-primary text-white text-sm font-semibold rounded-2xl hover:opacity-90 transition-all shadow-lg shadow-primary/25"
        >
          Voir les missions
        </button>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-5">
      {error && (
        <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-2xl text-sm text-red-700">
          {error}
        </div>
      )}

      {missions.map((m) => {
        const action = NEXT_ACTION[m.status]
        return (
          <div key={m.id} className="bg-white rounded-2xl border border-brand-border shadow-sm overflow-hidden">
            {/* Status bar */}
            <div className="bg-primary px-5 py-3 flex items-center justify-between">
              <div>
                <p className="text-xs text-primary-100 font-medium">Mission</p>
                <p className="text-sm font-bold text-white font-mono">{m.reference}</p>
              </div>
              <span className="text-xs bg-white/20 text-white px-3 py-1 rounded-xl font-semibold">
                {STATUS_LABELS[m.status] ?? m.status}
              </span>
            </div>

            <div className="p-5 space-y-4">
              {/* Progress steps */}
              <div className="flex items-center gap-2">
                {(['assigned', 'picking_up', 'in_delivery', 'delivered'] as const).map((s, i, arr) => {
                  const statuses = ['assigned', 'picking_up', 'in_delivery', 'delivered']
                  const currentIdx = statuses.indexOf(m.status)
                  const stepIdx = i
                  const isDone = stepIdx < currentIdx
                  const isCurrent = stepIdx === currentIdx
                  return (
                    <div key={s} className="flex items-center flex-1 last:flex-none">
                      <div className={cn(
                        'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0',
                        isDone    ? 'bg-green-500 text-white' :
                        isCurrent ? 'bg-primary text-white ring-4 ring-primary/20' :
                                    'bg-brand-muted text-gray-700',
                      )}>
                        {isDone ? <CheckCircle size={14} /> : i + 1}
                      </div>
                      {i < arr.length - 1 && (
                        <div className={cn('flex-1 h-0.5 mx-1', stepIdx < currentIdx ? 'bg-green-400' : 'bg-brand-border')} />
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Addresses */}
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-brand-muted/30 rounded-xl">
                  <MapPin size={15} className="text-primary mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-700 mb-0.5">Enlèvement · {m.sender_name}</p>
                    <p className="text-sm font-medium text-brand-foreground truncate">{shortAddr(m.pickup_address)}</p>
                    <a href={`tel:${m.sender_phone}`} className="flex items-center gap-1 text-xs text-primary mt-1 hover:underline">
                      <Phone size={11} /> {m.sender_phone}
                    </a>
                  </div>
                </div>

                <div className="flex justify-center">
                  <ChevronRight size={16} className="text-gray-700 rotate-90" />
                </div>

                <div className="flex items-start gap-3 p-3 bg-brand-muted/30 rounded-xl">
                  <MapPin size={15} className="text-secondary mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-700 mb-0.5">Livraison · {m.recipient_name}</p>
                    <p className="text-sm font-medium text-brand-foreground truncate">{shortAddr(m.delivery_address)}</p>
                    <a href={`tel:${m.recipient_phone}`} className="flex items-center gap-1 text-xs text-primary mt-1 hover:underline">
                      <Phone size={11} /> {m.recipient_phone}
                    </a>
                  </div>
                </div>
              </div>

              {/* Info row */}
              <div className="flex items-center gap-3 text-xs text-gray-700">
                <span className={cn(
                  'px-2 py-1 rounded-xl font-semibold',
                  m.delivery_type === 'express' ? 'bg-amber-50 text-amber-700' : 'bg-blue-50 text-blue-700',
                )}>
                  {m.delivery_type === 'express' ? 'Express' : 'Standard'}
                </span>
                <span className="font-bold text-primary">{fmtPrice(m.price)}</span>
                {m.distance && <span>{Number(m.distance).toFixed(1)} km</span>}
              </div>

              {/* Action button */}
              {action && (
                <button
                  onClick={() => handleAdvance(m)}
                  disabled={updating === m.id}
                  className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-primary text-white text-sm font-semibold rounded-2xl hover:opacity-90 disabled:opacity-60 transition-all shadow-lg shadow-primary/25"
                >
                  {updating === m.id
                    ? <><Loader2 size={15} className="animate-spin" /> Mise à jour…</>
                    : <><CheckCircle size={15} /> {action.label}</>
                  }
                </button>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
