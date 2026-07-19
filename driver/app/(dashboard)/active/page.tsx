'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { apiGet, apiPatch, apiPost } from '@/lib/api-client'

type Payment = {
  id: string
  method: string
  status: string
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
  sender_name: string
  sender_phone: string
  recipient_name: string
  recipient_phone: string
  payment?: Payment
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

const CASH_METHODS = ['cash_on_delivery', 'agency']

function isCashPayment(m: Mission) {
  return m.payment && CASH_METHODS.includes(m.payment.method)
}

function fmtPrice(v: string | number) {
  return Number(v).toLocaleString('fr-FR') + ' FCFA'
}

function short(addr: string) {
  return addr.split(',')[0]?.trim() ?? addr
}

// ─── Payment confirmation modal ───────────────────────────────────────────────

function PaymentConfirmModal({
  mission,
  onConfirm,
  onCancel,
  confirming,
}: {
  mission: Mission
  onConfirm: (confirmation: string) => void
  onCancel: () => void
  confirming: boolean
}) {
  const [typed, setTyped] = useState('')
  const KEYWORD = 'PAIEMENTRECU'
  const valid = typed === KEYWORD

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />

      {/* Sheet */}
      <div className="relative w-full max-w-md bg-white rounded-t-3xl px-6 pt-6 pb-10 shadow-xl">
        {/* Handle */}
        <div className="w-10 h-1 rounded-full bg-gray-200 mx-auto mb-6" />

        {/* Icon */}
        <div className="w-14 h-14 rounded-2xl bg-[#861D6D]/10 flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">💵</span>
        </div>

        <h2 className="text-lg font-bold text-[#1D1D1F] text-center mb-1">
          Confirmer la réception du paiement
        </h2>
        <p className="text-sm text-gray-500 text-center mb-1">
          Mission <span className="font-mono font-semibold text-[#861D6D]">{mission.reference}</span>
        </p>
        <p className="text-base font-bold text-[#1D1D1F] text-center mb-5">
          {fmtPrice(mission.price)}
        </p>

        <p className="text-sm text-gray-600 mb-2">
          Tapez <span className="font-bold text-[#861D6D]">{KEYWORD}</span> pour confirmer que vous avez bien encaissé le paiement :
        </p>

        <input
          type="text"
          value={typed}
          onChange={(e) => setTyped(e.target.value.toUpperCase())}
          placeholder={KEYWORD}
          className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm font-mono font-semibold tracking-widest text-center focus:outline-none focus:border-[#861D6D] transition-colors mb-4"
          autoCapitalize="characters"
          autoComplete="off"
          spellCheck={false}
        />

        {typed.length > 0 && !valid && (
          <p className="text-xs text-red-500 text-center -mt-2 mb-3">
            Mot-clé incorrect — tapez exactement : {KEYWORD}
          </p>
        )}

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-600 text-sm font-semibold active:scale-95 transition-transform"
          >
            Annuler
          </button>
          <button
            onClick={() => onConfirm(typed)}
            disabled={!valid || confirming}
            className="flex-1 py-3 rounded-xl bg-[#861D6D] text-white text-sm font-semibold shadow-lg shadow-[#861D6D]/25 disabled:opacity-40 active:scale-95 transition-transform"
          >
            {confirming ? 'Validation…' : 'Valider ✓'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Payment success overlay ──────────────────────────────────────────────────

type Phase = 'idle' | 'circle' | 'check' | 'content'

function PaymentSuccessOverlay({
  mission,
  onDone,
}: {
  mission: Mission
  onDone: () => void
}) {
  const [phase, setPhase] = useState<Phase>('idle')

  const done = useCallback(onDone, [onDone])

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('circle'), 80)
    const t2 = setTimeout(() => setPhase('check'), 480)
    const t3 = setTimeout(() => setPhase('content'), 900)
    const t4 = setTimeout(done, 3200)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4) }
  }, [done])

  return (
    <div className="fixed inset-0 z-50 bg-[#FAF7FB] flex flex-col items-center justify-center px-6 text-center gap-6">
      <style>{`
        @keyframes ps-scale-in {
          0%   { transform: scale(0); opacity: 0; }
          65%  { transform: scale(1.18); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes ps-draw-check {
          to { stroke-dashoffset: 0; }
        }
        @keyframes ps-fade-up {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes ps-pulse-ring {
          0%   { transform: scale(0.85); opacity: 0.5; }
          100% { transform: scale(1.5);  opacity: 0; }
        }
        .ps-circle-in   { animation: ps-scale-in 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
        .ps-check       { stroke-dasharray: 80; stroke-dashoffset: 80; animation: ps-draw-check 0.38s ease-out 0.08s forwards; }
        .ps-fade-up     { opacity: 0; animation: ps-fade-up 0.45s ease-out forwards; }
        .ps-pulse       { animation: ps-pulse-ring 1.4s ease-out 0.2s infinite; }
      `}</style>

      {/* Animated checkmark */}
      <div className="relative flex items-center justify-center w-24 h-24">
        {phase !== 'idle' && (
          <div className="absolute inset-0 rounded-full bg-green-300 ps-pulse" />
        )}
        {phase !== 'idle' && (
          <div className="relative w-20 h-20 bg-green-100 rounded-full flex items-center justify-center ps-circle-in">
            <svg width="44" height="44" viewBox="0 0 44 44" fill="none" aria-hidden>
              {(phase === 'check' || phase === 'content') && (
                <polyline
                  points="9,23 18,32 35,13"
                  stroke="#16a34a"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="ps-check"
                />
              )}
            </svg>
          </div>
        )}
      </div>

      {phase === 'content' && (
        <>
          <div className="ps-fade-up" style={{ animationDelay: '0ms' }}>
            <h1 className="text-2xl font-bold text-[#1D1D1F]">Paiement encaissé !</h1>
            <p className="text-gray-600 mt-2 leading-relaxed">
              <span className="font-bold text-[#1D1D1F]">{fmtPrice(mission.price)}</span> reçus
              pour la mission{' '}
              <span className="font-mono font-semibold text-[#861D6D]">{mission.reference}</span>.
            </p>
          </div>

          <button
            onClick={onDone}
            className="w-full max-w-xs bg-[#861D6D] text-white py-4 rounded-xl font-semibold ps-fade-up"
            style={{ animationDelay: '120ms' }}
          >
            Continuer vers la livraison →
          </button>
        </>
      )}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ActiveMissionPage() {
  const router = useRouter()
  const [missions, setMissions]       = useState<Mission[]>([])
  const [loading, setLoading]         = useState(true)
  const [updating, setUpdating]       = useState<string | null>(null)
  const [error, setError]             = useState<string | null>(null)
  const [paymentModal, setPaymentModal]     = useState<Mission | null>(null)
  const [confirming, setConfirming]         = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState<{ mission: Mission; updated: Mission } | null>(null)

  useEffect(() => {
    apiGet<Mission[]>('/driver/missions')
      .then((ms) => setMissions(ms.filter((m) => ACTIVE.has(m.status))))
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  async function advance(m: Mission) {
    const action = NEXT_ACTION[m.status]
    if (!action) return

    // For cash/agency missions at pickup step, require payment confirmation
    if (m.status === 'picking_up' && isCashPayment(m)) {
      setPaymentModal(m)
      return
    }

    setUpdating(m.id)
    setError(null)
    try {
      const updated = await apiPatch<Mission>(`/driver/missions/${m.id}/status`, { status: action.next })
      applyUpdate(m.id, updated)
    } catch (e: unknown) {
      setError((e as Error).message ?? 'Erreur de mise à jour.')
    } finally {
      setUpdating(null)
    }
  }

  async function handlePaymentConfirm(confirmation: string) {
    if (!paymentModal) return
    setConfirming(true)
    setError(null)
    const mission = paymentModal
    try {
      const updated = await apiPost<Mission>(`/driver/missions/${mission.id}/confirm-payment`, { confirmation })
      setPaymentModal(null)
      setPaymentSuccess({ mission, updated })
    } catch (e: unknown) {
      setError((e as Error).message ?? 'Erreur de confirmation du paiement.')
      setPaymentModal(null)
    } finally {
      setConfirming(false)
    }
  }

  function handlePaymentSuccessDone() {
    if (!paymentSuccess) return
    const { updated } = paymentSuccess
    setPaymentSuccess(null)
    applyUpdate(paymentSuccess.mission.id, updated)
  }

  function applyUpdate(id: string, updated: Mission) {
    if (ACTIVE.has(updated.status)) {
      setMissions((ms) => ms.map((x) => x.id === id ? updated : x))
    } else {
      setMissions((ms) => ms.filter((x) => x.id !== id))
      if (updated.status === 'delivered') router.push('/history')
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
    <>
      {paymentSuccess && (
        <PaymentSuccessOverlay
          mission={paymentSuccess.mission}
          onDone={handlePaymentSuccessDone}
        />
      )}

      {paymentModal && (
        <PaymentConfirmModal
          mission={paymentModal}
          onConfirm={handlePaymentConfirm}
          onCancel={() => setPaymentModal(null)}
          confirming={confirming}
        />
      )}

      <div className="px-4 pt-4 flex flex-col gap-4">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">{error}</div>
        )}

        {missions.map((m) => {
          const action  = NEXT_ACTION[m.status]
          const current = statusIdx(m.status)
          const needsPayment = m.status === 'picking_up' && isCashPayment(m)

          return (
            <div key={m.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              {/* Header */}
              <div className="bg-[#861D6D] px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="text-xs text-white/70">Mission</p>
                  <p className="text-sm font-bold text-white font-mono">{m.reference}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-white/20 text-white">
                    {m.delivery_type === 'express' ? 'Express' : 'Standard'}
                  </span>
                </div>
              </div>

              {/* Progress steps */}
              <div className="flex items-center px-4 py-3 gap-1">
                {STEPS.map((step, i) => {
                  const done   = i < current
                  const active = i === current
                  const future = i > current
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
                    className="w-full py-4 rounded-xl font-semibold text-sm mt-2 disabled:opacity-60 active:scale-95 transition-transform bg-[#861D6D] text-white shadow-lg shadow-[#861D6D]/25"
                  >
                    {updating === m.id ? 'Mise à jour…' : action.label}
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}
