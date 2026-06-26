'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import {
  CheckCircle, CreditCard, Smartphone, Building2,
  Package, MapPin, ArrowLeft, Loader2,
  Clock, AlertCircle,
} from 'lucide-react'
import { apiGet, apiPost } from '@/lib/api'
import { cn } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

type PaymentMethod = 'mtn_momo' | 'moov_money' | 'card' | 'cash_on_delivery' | 'agency'
type PaymentStatus = 'pending' | 'succeeded' | 'failed'
type DeliveryStatus =
  | 'draft' | 'awaiting_payment' | 'awaiting_validation'
  | 'confirmed' | 'assigned' | 'picking_up' | 'in_delivery'
  | 'delivered' | 'cancelled'

type Payment = {
  id: string
  amount: number
  method: PaymentMethod
  status: PaymentStatus
  transaction_reference: string | null
}

type Delivery = {
  id: string
  reference: string
  status: DeliveryStatus
  price: number
  sender_name: string
  pickup_address: string
  recipient_name: string
  delivery_address: string
  delivery_type: 'standard' | 'express'
  package_type: string
  paid_at: string | null
  payment: Payment
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const METHOD_LABELS: Record<PaymentMethod, string> = {
  mtn_momo:         'MTN MoMo',
  moov_money:       'Moov Money',
  card:             'Carte bancaire',
  cash_on_delivery: 'Paiement à la livraison',
  agency:           'Paiement en agence',
}

const AVAILABLE_PAYMENT_METHOD: PaymentMethod = 'cash_on_delivery'
const UNAVAILABLE_PAYMENT_MESSAGE = 'Ce mode de paiement n’est pas encore disponible. Seul le paiement à la livraison est actif pour le moment.'

function fmtPrice(n: number) {
  return Number(n).toLocaleString('fr-FR') + ' FCFA'
}

function MethodIcon({ method }: { method: PaymentMethod }) {
  if (method === 'mtn_momo' || method === 'moov_money') return <Smartphone size={20} className="text-primary" />
  if (method === 'card') return <CreditCard size={20} className="text-primary" />
  return <Building2 size={20} className="text-primary" />
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function PaymentPage() {
  const router  = useRouter()
  const params  = useParams()
  const id      = params.id as string

  const [delivery, setDelivery] = useState<Delivery | null>(null)
  const [paid,     setPaid]     = useState<Delivery | null>(null)
  const [loading,  setLoading]  = useState(true)
  const [paying,   setPaying]   = useState(false)
  const [fetchErr, setFetchErr] = useState<string | null>(null)
  const [payErr,   setPayErr]   = useState<string | null>(null)

  useEffect(() => {
    apiGet<Delivery>(`/deliveries/${id}`)
      .then((d) => {
        if (d.status !== 'awaiting_payment') {
          router.replace('/history')
          return
        }
        setDelivery(d)
      })
      .catch((e: Error) => setFetchErr(e.message))
      .finally(() => setLoading(false))
  }, [id, router])

  async function handlePay() {
    if (!delivery) return
    setPaying(true)
    setPayErr(null)

    const method = delivery.payment.method
    if (method !== AVAILABLE_PAYMENT_METHOD) {
      setPaying(false)
      setPayErr(UNAVAILABLE_PAYMENT_MESSAGE)
      return
    }

    try {
      const result = await apiPost<Delivery>(`/deliveries/${id}/pay`, {}, true)
      setPaid(result)
    } catch (e: unknown) {
      const err = e as Error & { errors?: Record<string, string[]> }
      const firstValidation = err.errors ? Object.values(err.errors)[0]?.[0] : undefined
      setPayErr(firstValidation ?? err.message ?? 'Une erreur est survenue.')
    } finally {
      setPaying(false)
    }
  }

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="p-4 sm:p-6 flex items-center justify-center min-h-[60vh]">
        <Loader2 size={32} className="text-primary animate-spin" />
      </div>
    )
  }

  if (fetchErr || !delivery) {
    return (
      <div className="p-4 sm:p-6 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <AlertCircle size={40} className="text-red-400 mx-auto mb-4" />
          <p className="text-sm text-red-600">{fetchErr ?? 'Livraison introuvable.'}</p>
          <button
            onClick={() => router.back()}
            className="mt-4 text-sm text-primary underline"
          >
            Retour
          </button>
        </div>
      </div>
    )
  }

  const method = delivery.payment.method
  const isPaymentUnavailable = method !== AVAILABLE_PAYMENT_METHOD

  // ── Receipt (success) ─────────────────────────────────────────────────────
  if (paid) {
    const isConfirmed = paid.status === 'confirmed'

    return (
      <div className="p-4 sm:p-6 flex items-center justify-center min-h-[60vh]">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl border border-brand-border shadow-sm p-5 text-center sm:p-8">
            <div className={cn(
              'w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6',
              isConfirmed ? 'bg-green-50' : 'bg-amber-50',
            )}>
              {isConfirmed
                ? <CheckCircle size={40} className="text-green-500" />
                : <Clock size={40} className="text-amber-500" />
              }
            </div>

            <h2 className="text-2xl font-bold text-brand-foreground mb-1">
              {isConfirmed ? 'Paiement confirmé !' : 'Demande enregistrée'}
            </h2>
            <p className="text-sm text-gray-700 mb-6">
              {isConfirmed
                ? 'Votre commande est confirmée et sera traitée prochainement.'
                : 'Votre commande est en attente de validation par notre équipe.'
              }
            </p>

            {/* Receipt details */}
            <div className="bg-brand-muted/30 rounded-2xl p-5 text-left space-y-3 mb-6">
              <Row label="Référence" value={paid.reference} mono />
              <Row label="Mode de paiement" value={METHOD_LABELS[method]} />
              <Row label="Montant" value={fmtPrice(paid.payment.amount)} />
              {paid.payment.transaction_reference && (
                <Row label="Réf. transaction" value={paid.payment.transaction_reference} mono />
              )}
              <Row
                label="Statut"
                value={isConfirmed ? 'Confirmée' : 'En attente de validation'}
                valueClass={isConfirmed ? 'text-green-600 font-semibold' : 'text-amber-600 font-semibold'}
              />
            </div>

            {!isConfirmed && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-700 mb-6 text-left">
                {method === 'cash_on_delivery'
                  ? 'Le livreur collectera le paiement à la livraison. Votre commande sera confirmée après validation.'
                  : 'Rendez-vous dans une agence partenaire pour effectuer votre paiement. Votre commande sera confirmée après validation.'
                }
              </div>
            )}

            <div className="flex flex-col gap-3">
              <button
                onClick={() => router.push('/dashboard')}
                className="w-full px-6 py-3 bg-primary text-white text-sm font-semibold rounded-2xl hover:opacity-90 transition-all shadow-lg shadow-primary/25"
              >
                Retour au tableau de bord
              </button>
              <button
                onClick={() => router.push('/history')}
                className="w-full px-6 py-3 border-2 border-primary text-primary text-sm font-semibold rounded-2xl hover:bg-primary/5 transition-all"
              >
                Voir mes livraisons
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── Payment form ──────────────────────────────────────────────────────────
  return (
    <div className="p-4 sm:p-6 max-w-lg mx-auto">

      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-gray-700 hover:text-primary mb-6 transition-colors"
      >
        <ArrowLeft size={16} /> Retour
      </button>

      <h1 className="text-xl font-bold text-brand-foreground mb-5 sm:mb-6 sm:text-2xl">Finaliser le paiement</h1>

      {/* Delivery summary */}
      <div className="bg-white rounded-2xl border border-brand-border shadow-sm p-4 mb-5 sm:p-5">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">Récapitulatif</h2>

        <div className="flex items-start gap-3 mb-3">
          <MapPin size={16} className="text-primary mt-0.5 shrink-0" />
          <div className="text-sm">
            <p className="text-gray-700 text-xs mb-0.5">De</p>
            <p className="font-medium text-brand-foreground">{delivery.sender_name}</p>
            <p className="text-gray-700 break-words">{delivery.pickup_address}</p>
          </div>
        </div>

        <div className="flex items-start gap-3 mb-4">
          <MapPin size={16} className="text-secondary mt-0.5 shrink-0" />
          <div className="text-sm">
            <p className="text-gray-700 text-xs mb-0.5">À</p>
            <p className="font-medium text-brand-foreground">{delivery.recipient_name}</p>
            <p className="text-gray-700 break-words">{delivery.delivery_address}</p>
          </div>
        </div>

        <div className="border-t border-brand-border pt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-2">
            <Package size={16} className="text-gray-700" />
            <span className="truncate text-sm text-gray-700">
              {delivery.delivery_type === 'express' ? 'Express' : 'Standard'} — {delivery.reference}
            </span>
          </div>
          <span className="text-xl font-extrabold text-primary">{fmtPrice(delivery.payment.amount)}</span>
        </div>
      </div>

      {/* Payment method block */}
      <div className="bg-white rounded-2xl border border-brand-border shadow-sm p-4 mb-5 sm:p-5">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">Mode de paiement</h2>

        <div className={cn(
          'flex items-center gap-3 p-4 border-2 rounded-2xl mb-5',
          isPaymentUnavailable
            ? 'bg-gray-50 border-gray-200 opacity-75'
            : 'bg-primary/5 border-primary',
        )}>
          <div className={cn(
            'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
            isPaymentUnavailable ? 'bg-gray-100' : 'bg-primary/10',
          )}>
            <MethodIcon method={method} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-brand-foreground">{METHOD_LABELS[method]}</p>
            {method === 'mtn_momo' && <p className="text-xs text-gray-700">Paiement mobile MTN</p>}
            {method === 'moov_money' && <p className="text-xs text-gray-700">Paiement mobile Moov</p>}
            {method === 'card' && <p className="text-xs text-gray-700">Visa, Mastercard</p>}
            {method === 'cash_on_delivery' && <p className="text-xs text-gray-700">En espèces à la réception</p>}
            {method === 'agency' && <p className="text-xs text-gray-700">Dans une agence partenaire</p>}
          </div>
          {isPaymentUnavailable && (
            <span className="shrink-0 rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
              Bientôt disponible
            </span>
          )}
        </div>

        {isPaymentUnavailable ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            {UNAVAILABLE_PAYMENT_MESSAGE}
          </div>
        ) : (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            Le livreur récupèrera le montant en espèces lors de la livraison. Votre commande passera en attente de validation.
          </div>
        )}
      </div>

      {/* Error */}
      {payErr && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-2xl text-sm text-red-700 flex items-center gap-2">
          <AlertCircle size={16} className="shrink-0" />
          {payErr}
        </div>
      )}

      {/* CTA */}
      <button
        onClick={handlePay}
        disabled={paying || isPaymentUnavailable}
        className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-primary text-white text-sm font-semibold rounded-2xl hover:opacity-90 disabled:opacity-60 transition-all shadow-lg shadow-primary/25"
      >
        {paying
          ? <><Loader2 size={16} className="animate-spin" /> Traitement en cours…</>
          : isPaymentUnavailable
            ? 'Mode de paiement indisponible'
            : 'Confirmer la commande'
        }
      </button>
    </div>
  )
}

// ─── Receipt row ──────────────────────────────────────────────────────────────

function Row({
  label, value, mono = false, valueClass,
}: {
  label: string
  value: string
  mono?: boolean
  valueClass?: string
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-xs text-gray-700 shrink-0">{label}</span>
      <span className={cn('text-sm text-right break-words', mono ? 'font-mono font-bold text-brand-foreground' : 'font-medium text-brand-foreground', valueClass)}>
        {value}
      </span>
    </div>
  )
}
