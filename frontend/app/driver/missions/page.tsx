'use client'

import { useEffect, useState } from 'react'
import { MapPin, Package, Clock, CheckCircle, XCircle } from 'lucide-react'
import { apiGet, apiPost } from '@/lib/api'
import { cn } from '@/lib/utils'

type Client = { id: string; name: string; phone: string }

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
  client: Client
  created_at: string
}

const PACKAGE_LABELS: Record<string, string> = {
  document: 'Document',
  small:    'Petit colis',
  medium:   'Colis moyen',
  large:    'Grand colis',
}

function fmtPrice(v: string | number) {
  return Number(v).toLocaleString('fr-FR') + ' FCFA'
}

function shortAddr(addr: string) {
  return addr.split(',')[0]?.trim() ?? addr
}

export default function AvailableMissionsPage() {
  const [missions, setMissions]   = useState<Mission[]>([])
  const [declined, setDeclined]   = useState<Set<string>>(new Set())
  const [loading, setLoading]     = useState(true)
  const [accepting, setAccepting] = useState<string | null>(null)
  const [error, setError]         = useState<string | null>(null)

  useEffect(() => {
    apiGet<Mission[]>('/driver/missions/available')
      .then(setMissions)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  async function handleAccept(id: string) {
    setAccepting(id)
    setError(null)
    try {
      await apiPost(`/driver/missions/${id}/accept`, {}, true)
      setMissions((prev) => prev.filter((m) => m.id !== id))
    } catch (e: unknown) {
      setError((e as Error).message ?? 'Erreur lors de l\'acceptation.')
    } finally {
      setAccepting(null)
    }
  }

  function handleDecline(id: string) {
    setDeclined((prev) => new Set(prev).add(id))
  }

  const visible = missions.filter((m) => !declined.has(m.id))

  return (
    <div className="p-6 space-y-5">
      <p className="text-sm text-gray-700">
        {visible.length} mission{visible.length !== 1 ? 's' : ''} disponible{visible.length !== 1 ? 's' : ''}
      </p>

      {error && (
        <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-2xl text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : visible.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
            <Package size={32} className="text-primary" />
          </div>
          <h3 className="text-base font-semibold text-brand-foreground mb-1">Aucune mission disponible</h3>
          <p className="text-sm text-gray-700">Revenez dans quelques instants.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {visible.map((m) => (
            <div key={m.id} className="bg-white rounded-2xl border border-brand-border shadow-sm p-5">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <p className="text-xs font-mono text-primary font-bold">{m.reference}</p>
                  <p className="text-xs text-gray-700 mt-0.5">
                    Client : <span className="font-medium text-brand-foreground">{m.client?.name}</span>
                    {m.client?.phone && <span className="ml-2 text-gray-700">{m.client.phone}</span>}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={cn(
                    'text-xs font-semibold px-2 py-1 rounded-xl',
                    m.delivery_type === 'express' ? 'bg-amber-50 text-amber-700' : 'bg-blue-50 text-blue-700',
                  )}>
                    {m.delivery_type === 'express' ? 'Express' : 'Standard'}
                  </span>
                  <span className="text-sm font-bold text-primary">{fmtPrice(m.price)}</span>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-start gap-2">
                  <MapPin size={14} className="text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-700">Enlèvement</p>
                    <p className="text-sm font-medium text-brand-foreground">{shortAddr(m.pickup_address)}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin size={14} className="text-secondary mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-700">Livraison</p>
                    <p className="text-sm font-medium text-brand-foreground">{shortAddr(m.delivery_address)}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-gray-700 mb-4">
                <Package size={13} /> {PACKAGE_LABELS[m.package_type] ?? m.package_type}
                {m.distance && <><span className="mx-1">·</span><Clock size={13} /> {Number(m.distance).toFixed(1)} km</>}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => handleDecline(m.id)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-gray-200 text-gray-700 text-sm font-semibold rounded-2xl hover:border-red-300 hover:text-red-600 transition-all"
                >
                  <XCircle size={15} /> Refuser
                </button>
                <button
                  onClick={() => handleAccept(m.id)}
                  disabled={accepting === m.id}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white text-sm font-semibold rounded-2xl hover:opacity-90 disabled:opacity-60 transition-all shadow-lg shadow-primary/25"
                >
                  <CheckCircle size={15} />
                  {accepting === m.id ? 'Acceptation…' : 'Accepter'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
