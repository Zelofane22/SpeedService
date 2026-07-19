'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { apiGet, apiPatch, apiPost, type DriverUser } from '@/lib/api-client'
import { formatDriverLocalDate, parseApiDate } from '@/lib/utils'

type StatusHistory = {
  status: string
  created_at: string
}

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
  status_histories?: StatusHistory[]
}

type DriverProfile = {
  user: DriverUser
}

type AvailabilityResponse = {
  id: string
  is_online: boolean
}

function fmtPrice(v: string | number) {
  return Number(v).toLocaleString('fr-FR') + ' FCFA'
}

function short(addr: string) {
  return addr.split(',')[0]?.trim() ?? addr
}

function isThisMonth(iso: string) {
  const d = parseApiDate(iso)
  if (!d) return false
  const now = new Date()
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
}

function deliveredAt(mission: Mission) {
  return mission.status_histories?.find((history) => history.status === 'delivered')?.created_at ?? mission.created_at
}

export default function MissionsPage() {
  const router = useRouter()
  const [user, setUser]         = useState<DriverUser | null>(null)
  const [missions, setMissions] = useState<Mission[]>([])
  const [doneCount, setDoneCount] = useState(0)
  const [declined, setDeclined] = useState<Set<string>>(new Set())
  const [loading, setLoading]   = useState(true)
  const [accepting, setAccepting] = useState<string | null>(null)
  const [availabilityUpdating, setAvailabilityUpdating] = useState(false)
  const [error, setError]       = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      apiGet<DriverProfile>('/driver/profile'),
      apiGet<Mission[]>('/driver/missions/available'),
      apiGet<Mission[]>('/driver/missions'),
    ])
      .then(([profile, avail, hist]) => {
        setUser(profile.user)
        setMissions(avail)
        setDoneCount(
          hist.filter((m) => m.status === 'delivered' && isThisMonth(deliveredAt(m))).length
        )
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  async function accept(id: string) {
    setAccepting(id)
    setError(null)
    try {
      await apiPost(`/driver/missions/${id}/accept`, {})
      setMissions((ms) => ms.filter((m) => m.id !== id))
      router.push('/active')
    } catch (e: unknown) {
      setError((e as Error).message ?? "Erreur lors de l'acceptation.")
    } finally {
      setAccepting(null)
    }
  }

  async function toggleAvailability() {
    if (!user) return
    const next = !user.is_online
    setAvailabilityUpdating(true)
    setError(null)
    try {
      const updated = await apiPatch<AvailabilityResponse>('/driver/availability', { is_online: next })
      setUser((current) => current ? { ...current, is_online: updated.is_online } : current)
      if (!updated.is_online) {
        setMissions([])
      } else {
        setMissions(await apiGet<Mission[]>('/driver/missions/available'))
      }
    } catch (e: unknown) {
      setError((e as Error).message ?? 'Impossible de mettre à jour votre disponibilité.')
    } finally {
      setAvailabilityUpdating(false)
    }
  }

  const visible = missions.filter((m) => !declined.has(m.id))
  const isOnline = user?.is_online ?? true

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#861D6D] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="px-5 pt-5 pb-4">
      {/* Greeting */}
      <div className="flex items-center justify-between gap-3 mb-6">
        <div>
          <p className="text-xs text-gray-500 dark:text-[#b9adba]">Bonjour,</p>
          <h1 className="text-xl font-bold text-[#1D1D1F] dark:text-gray-100">{user?.name ?? '—'} 👋</h1>
        </div>
        <button
          type="button"
          onClick={toggleAvailability}
          disabled={availabilityUpdating}
          aria-pressed={isOnline}
          className={`inline-flex min-h-10 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#861D6D]/40 disabled:opacity-60 ${
            isOnline
              ? 'border-green-200 bg-green-50 text-green-700 dark:border-green-700/50 dark:bg-green-950/40 dark:text-green-300'
              : 'border-gray-200 bg-white text-gray-600 dark:border-gray-700 dark:bg-[#181A20] dark:text-gray-300'
          }`}
        >
          <span className={`h-2 w-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
          {availabilityUpdating ? 'Mise à jour…' : isOnline ? 'En ligne' : 'Hors ligne'}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-[#861D6D]/10 rounded-2xl p-3 text-center dark:bg-[#2a1830]">
          <p className="text-2xl font-extrabold text-[#861D6D]">{visible.length}</p>
          <p className="text-xs text-gray-500 mt-0.5 dark:text-[#b9adba]">Missions dispo.</p>
        </div>
        <div className="bg-blue-50 rounded-2xl p-3 text-center dark:bg-blue-950/30">
          <p className="text-2xl font-extrabold text-blue-600 dark:text-blue-300">{doneCount}</p>
          <p className="text-xs text-gray-500 mt-0.5 dark:text-[#b9adba]">Livrées ce mois</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700 mb-4">
          {error}
        </div>
      )}

      {/* Mission list */}
      <h2 className="text-base font-bold text-[#1D1D1F] mb-3 dark:text-gray-100">Missions disponibles</h2>

      {visible.length === 0 ? (
        <div className="flex flex-col items-center text-center py-12 gap-3">
          <div className="text-5xl">🛵</div>
          <p className="font-semibold text-[#1D1D1F] dark:text-gray-100">
            {isOnline ? 'Aucune mission disponible' : 'Vous êtes hors ligne'}
          </p>
          <p className="text-sm text-gray-500 dark:text-[#b9adba]">
            {isOnline ? 'Revenez dans quelques instants.' : 'Repassez en ligne pour recevoir de nouvelles missions.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {visible.map((m) => (
            <div
              key={m.id}
              className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm active:scale-[0.98] transition-transform dark:bg-[#181A20] dark:border-[#39313d]"
            >
              {/* Top row */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-xs font-mono font-bold text-[#861D6D]">{m.reference}</p>
                  <p className="text-xs text-gray-500 mt-0.5 dark:text-[#b9adba]">{m.client?.name} · {m.client?.phone}</p>
                  {m.delivery_type === 'express' && (
                    <span className="inline-block mt-1.5 px-2 py-0.5 bg-amber-50 text-amber-700 text-[10px] font-bold rounded-full dark:bg-amber-950/40 dark:text-amber-300">
                      URGENT
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-base font-bold text-[#861D6D]">{fmtPrice(m.price)}</p>
                  {m.distance && (
                    <p className="text-xs text-gray-400 mt-0.5 dark:text-[#b9adba]">{Number(m.distance).toFixed(1)} km</p>
                  )}
                </div>
              </div>

              <p className="mb-3 text-xs text-gray-400 dark:text-[#b9adba]">
                Créée le {formatDriverLocalDate(m.created_at, { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
              </p>

              {/* Route — dot trail */}
              <div className="mb-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-[#1D1D1F] dark:text-gray-100">
                  <div className="w-2 h-2 rounded-full bg-[#861D6D] shrink-0" />
                  {short(m.pickup_address)}
                </div>
                <div className="ml-[7px] border-l-2 border-dashed border-gray-300 my-1 dark:border-gray-700" style={{ height: 10 }} />
                <div className="flex items-center gap-2 text-sm font-semibold text-[#1D1D1F] dark:text-gray-100">
                  <div className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
                  {short(m.delivery_address)}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => setDeclined((d) => new Set(d).add(m.id))}
                  className="flex-1 py-2.5 rounded-xl border-2 border-gray-200 text-gray-600 text-sm font-semibold active:scale-95 transition-transform dark:border-gray-700 dark:text-gray-200"
                >
                  Refuser
                </button>
                <button
                  onClick={() => accept(m.id)}
                  disabled={accepting === m.id}
                  className="flex-1 py-2.5 rounded-xl bg-[#861D6D] text-white text-sm font-semibold shadow-lg shadow-[#861D6D]/25 disabled:opacity-60 active:scale-95 transition-transform dark:bg-[#b24799]"
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
