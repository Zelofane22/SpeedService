'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import {
  CheckCircle, CreditCard, Smartphone, Building2,
  Package, MapPin, ArrowLeft, Loader2, ShieldCheck,
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

function fmtPrice(n: number) {
  return Number(n).toLocaleString('fr-FR') + ' FCFA'
}

function MethodIcon({ method }: { method: PaymentMethod }) {
  if (method === 'mtn_momo' || method === 'moov_money') return <Smartphone size={20} className="text-primary" />
  if (method === 'card') return <CreditCard size={20} className="text-primary" />
  return <Building2 size={20} className="text-primary" />
}

// ─── Field ────────────────────────────────────────────────────────────────────

function Field({
  label, value, onChange, placeholder, type = 'text', maxLength,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
  maxLength?: number
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-brand-foreground">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        className="w-full bg-brand-input border border-brand-border rounded-2xl px-4 py-3 text-sm placeholder:text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
      />
    </div>
  )
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

  // Mobile Money
  const [phone, setPhone] = useState('')
  // Card
  const [cardNumber,     setCardNumber]     = useState('')
  const [expiry,         setExpiry]         = useState('')
  const [cvv,            setCvv]            = useState('')
  const [cardholderName, setCardholderName] = useState('')

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
    let body: Record<string, string> = {}

    if (method === 'mtn_momo' || method === 'moov_money') {
      body = { phone }
    } else if (method === 'card') {
      body = {
        card_number:     cardNumber.replace(/\s/g, ''),
        expiry,
        cvv,
        cardholder_name: cardholderName,
      }
    }

    try {
      const result = await apiPost<Delivery>(`/deliveries/${id}/pay`, body, true)
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
      <div className="p-6 flex items-center justify-center min-h-[60vh]">
        <Loader2 size={32} className="text-primary animate-spin" />
      </div>
    )
  }

  if (fetchErr || !delivery) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh]">
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
  const isManual = method === 'cash_on_delivery' || method === 'agency'

  // ── Receipt (success) ─────────────────────────────────────────────────────
  if (paid) {
    const isConfirmed = paid.status === 'confirmed'

    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh]">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl border border-brand-border shadow-sm p-8 text-center">
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
    <div className="p-6 max-w-lg mx-auto">

      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-gray-700 hover:text-primary mb-6 transition-colors"
      >
        <ArrowLeft size={16} /> Retour
      </button>

      <h1 className="text-2xl font-bold text-brand-foreground mb-6">Finaliser le paiement</h1>

      {/* Delivery summary */}
      <div className="bg-white rounded-2xl border border-brand-border shadow-sm p-5 mb-5">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">Récapitulatif</h2>

        <div className="flex items-start gap-3 mb-3">
          <MapPin size={16} className="text-primary mt-0.5 shrink-0" />
          <div className="text-sm">
            <p className="text-gray-700 text-xs mb-0.5">De</p>
            <p className="font-medium text-brand-foreground">{delivery.sender_name}</p>
            <p className="text-gray-700">{delivery.pickup_address}</p>
          </div>
        </div>

        <div className="flex items-start gap-3 mb-4">
          <MapPin size={16} className="text-secondary mt-0.5 shrink-0" />
          <div className="text-sm">
            <p className="text-gray-700 text-xs mb-0.5">À</p>
            <p className="font-medium text-brand-foreground">{delivery.recipient_name}</p>
            <p className="text-gray-700">{delivery.delivery_address}</p>
          </div>
        </div>

        <div className="border-t border-brand-border pt-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package size={16} className="text-gray-700" />
            <span className="text-sm text-gray-700">
              {delivery.delivery_type === 'express' ? 'Express' : 'Standard'} — {delivery.reference}
            </span>
          </div>
          <span className="text-xl font-extrabold text-primary">{fmtPrice(delivery.payment.amount)}</span>
        </div>
      </div>

      {/* Payment method block */}
      <div className="bg-white rounded-2xl border border-brand-border shadow-sm p-5 mb-5">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">Mode de paiement</h2>

        <div className="flex items-center gap-3 p-4 bg-primary/5 border-2 border-primary rounded-2xl mb-5">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <MethodIcon method={method} />
          </div>
          <div>
            <p className="text-sm font-semibold text-brand-foreground">{METHOD_LABELS[method]}</p>
            {method === 'mtn_momo' && <p className="text-xs text-gray-700">Paiement mobile MTN</p>}
            {method === 'moov_money' && <p className="text-xs text-gray-700">Paiement mobile Moov</p>}
            {method === 'card' && <p className="text-xs text-gray-700">Visa, Mastercard</p>}
            {method === 'cash_on_delivery' && <p className="text-xs text-gray-700">En espèces à la réception</p>}
            {method === 'agency' && <p className="text-xs text-gray-700">Dans une agence partenaire</p>}
          </div>
        </div>

        {/* Mobile Money form */}
        {(method === 'mtn_momo' || method === 'moov_money') && (
          <div className="space-y-4">
            <p className="text-sm text-gray-700">
              Entrez votre numéro {method === 'mtn_momo' ? 'MTN' : 'Moov'} pour recevoir la demande de paiement.
            </p>
            <Field
              label="Numéro de téléphone"
              value={phone}
              onChange={setPhone}
              placeholder={method === 'mtn_momo' ? '96 XX XX XX' : '97 XX XX XX'}
              type="tel"
            />
          </div>
        )}

        {/* Card form */}
        {method === 'card' && (
          <div className="space-y-4">
            <Field
              label="Numéro de carte"
              value={cardNumber}
              onChange={(v) => setCardNumber(v.replace(/\D/g, '').slice(0, 16))}
              placeholder="4111 1111 1111 1111"
              maxLength={16}
            />
            <div className="grid grid-cols-2 gap-3">
              <Field
                label="Date d'expiration"
                value={expiry}
                onChange={(v) => {
                  const cleaned = v.replace(/\D/g, '').slice(0, 4)
                  setExpiry(cleaned.length > 2 ? cleaned.slice(0, 2) + '/' + cleaned.slice(2) : cleaned)
                }}
                placeholder="MM/AA"
                maxLength={5}
              />
              <Field
                label="CVV"
                value={cvv}
                onChange={(v) => setCvv(v.replace(/\D/g, '').slice(0, 4))}
                placeholder="123"
                maxLength={4}
              />
            </div>
            <Field
              label="Nom du titulaire"
              value={cardholderName}
              onChange={setCardholderName}
              placeholder="KOFFI MENSAH"
            />
            <div className="flex items-center gap-2 text-xs text-gray-700 mt-1">
              <ShieldCheck size={14} className="text-green-500" />
              Paiement sécurisé — vos données sont chiffrées
            </div>
          </div>
        )}

        {/* Cash / Agency */}
        {isManual && (
          <div className={cn(
            'rounded-2xl p-4 text-sm',
            method === 'cash_on_delivery'
              ? 'bg-amber-50 border border-amber-200 text-amber-800'
              : 'bg-blue-50 border border-blue-200 text-blue-800',
          )}>
            {method === 'cash_on_delivery'
              ? 'Le livreur récupèrera le montant en espèces lors de la livraison. Votre commande passera en attente de validation.'
              : 'Votre commande sera placée en attente. Rendez-vous dans une agence Speed Service avec votre référence de commande pour effectuer le paiement.'
            }
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
        disabled={paying}
        className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-primary text-white text-sm font-semibold rounded-2xl hover:opacity-90 disabled:opacity-60 transition-all shadow-lg shadow-primary/25"
      >
        {paying
          ? <><Loader2 size={16} className="animate-spin" /> Traitement en cours…</>
          : isManual
            ? 'Confirmer la commande'
            : `Payer ${fmtPrice(delivery.payment.amount)}`
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
    <div className="flex items-center justify-between gap-4">
      <span className="text-xs text-gray-700 shrink-0">{label}</span>
      <span className={cn('text-sm text-right', mono ? 'font-mono font-bold text-brand-foreground' : 'font-medium text-brand-foreground', valueClass)}>
        {value}
      </span>
    </div>
  )
}
