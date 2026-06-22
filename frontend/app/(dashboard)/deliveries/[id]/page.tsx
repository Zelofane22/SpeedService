'use client'

import { useCallback, useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Check,
  Clock3,
  CreditCard,
  MapPin,
  Package,
  Phone,
  RefreshCw,
  Truck,
  User,
} from 'lucide-react'
import { apiGet } from '@/lib/api'
import { StatusBadge } from '@/components/status-badge'
import { cn } from '@/lib/utils'

type StatusHistory = {
  id: string
  status: string
  note: string | null
  created_at: string
}

type Delivery = {
  id: string
  reference: string
  status: string
  package_type: string
  content_category: string
  package_description: string | null
  package_weight: string | null
  delivery_type: 'standard' | 'express'
  price: string
  distance: string | null
  sender_name: string
  sender_phone: string
  pickup_address: string
  recipient_name: string
  recipient_phone: string
  delivery_address: string
  created_at: string
  driver: { id: string; name: string; phone: string } | null
  payment: { method: string; status: string } | null
  status_histories: StatusHistory[]
}

const STATUS_LABELS: Record<string, string> = {
  draft: 'Brouillon',
  awaiting_payment: 'En attente de paiement',
  awaiting_validation: 'En attente de validation',
  confirmed: 'Commande confirmée',
  assigned: 'Livreur affecté',
  picking_up: 'Livreur en route vers l’enlèvement',
  in_delivery: 'Colis récupéré — en livraison',
  delivered: 'Colis livré',
  cancelled: 'Commande annulée',
}

const STATUS_DESCRIPTIONS: Record<string, string> = {
  awaiting_payment: 'La commande attend son règlement.',
  awaiting_validation: 'Le paiement physique doit être validé par Speed Service.',
  confirmed: 'La commande est prête à être prise en charge.',
  assigned: 'Un livreur a accepté la mission.',
  picking_up: 'Le livreur se dirige vers le point d’enlèvement.',
  in_delivery: 'Le colis est en route vers son destinataire.',
  delivered: 'La livraison a été confirmée par le livreur.',
  cancelled: 'Cette commande a été annulée.',
}

const PACKAGE_LABELS: Record<string, string> = {
  document: 'Document',
  small: 'Petit colis',
  medium: 'Colis moyen',
  large: 'Grand colis',
}

const CONTENT_LABELS: Record<string, string> = {
  document: 'Documents & Papiers',
  clothing: 'Vêtements & Textile',
  electronics: 'Électronique',
  food: 'Alimentaire',
  other: 'Autres',
}

const PAYMENT_LABELS: Record<string, string> = {
  mtn_momo: 'MTN Mobile Money',
  moov_money: 'Moov Money',
  card: 'Carte bancaire',
  cash_on_delivery: 'Paiement à la livraison',
  agency: 'Paiement en agence',
}

function formatDate(value: string, withTime = false) {
  return new Date(value).toLocaleString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {}),
  })
}

function formatPrice(value: string | number) {
  return `${Number(value).toLocaleString('fr-FR')} FCFA`
}

export default function DeliveryTrackingPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const [delivery, setDelivery] = useState<Delivery | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    else setRefreshing(true)

    try {
      const result = await apiGet<Delivery>(`/deliveries/${params.id}`)
      setDelivery(result)
      setError(null)
    } catch (caught) {
      setError((caught as Error).message || 'Impossible de charger cette livraison.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [params.id])

  useEffect(() => {
    void load()
    const interval = window.setInterval(() => void load(true), 30_000)
    return () => window.clearInterval(interval)
  }, [load])

  if (loading) {
    return <div className="flex justify-center py-28"><div className="h-7 w-7 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>
  }

  if (error || !delivery) {
    return (
      <div className="p-6">
        <div className="mx-auto max-w-lg rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-sm text-red-700">{error ?? 'Livraison introuvable.'}</p>
          <button type="button" onClick={() => router.back()} className="mt-4 text-sm font-semibold text-primary hover:underline">Retour</button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link href="/history" aria-label="Retour à l’historique" className="flex h-9 w-9 items-center justify-center rounded-xl border border-brand-border bg-white text-gray-600 hover:text-primary">
            <ArrowLeft size={17} />
          </Link>
          <div>
            <p className="font-mono text-sm font-bold text-primary">{delivery.reference}</p>
            <p className="text-xs text-gray-500">Créée le {formatDate(delivery.created_at, true)}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={delivery.status} />
          <button
            type="button"
            onClick={() => void load(true)}
            disabled={refreshing}
            className="flex items-center gap-2 rounded-xl border border-brand-border bg-white px-3 py-2 text-xs font-semibold text-gray-600 hover:border-primary/40 disabled:opacity-60"
          >
            <RefreshCw size={14} className={cn(refreshing && 'animate-spin')} /> Actualiser
          </button>
        </div>
      </div>

      <div className="rounded-2xl bg-primary p-5 text-white shadow-lg shadow-primary/20">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15">
            {delivery.status === 'delivered' ? <Check size={22} /> : <Truck size={22} />}
          </div>
          <div>
            <p className="text-xs font-medium text-white/70">Statut actuel</p>
            <h2 className="mt-0.5 text-lg font-bold">{STATUS_LABELS[delivery.status] ?? delivery.status}</h2>
            <p className="mt-1 text-sm text-white/80">{STATUS_DESCRIPTIONS[delivery.status]}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.35fr_0.65fr]">
        <section className="rounded-2xl border border-brand-border bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center gap-2">
            <Clock3 size={18} className="text-primary" />
            <h2 className="font-bold text-brand-foreground">Suivi de la commande</h2>
          </div>

          <ol className="space-y-0">
            {delivery.status_histories.map((history, index) => {
              const isLast = index === delivery.status_histories.length - 1
              const isCancelled = history.status === 'cancelled'
              return (
                <li key={history.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <span className={cn(
                      'flex h-8 w-8 items-center justify-center rounded-full text-white ring-4 ring-white',
                      isCancelled ? 'bg-red-500' : isLast ? 'bg-primary' : 'bg-green-500',
                    )}>
                      <Check size={15} />
                    </span>
                    {!isLast && <span className="min-h-10 w-0.5 flex-1 bg-green-200" />}
                  </div>
                  <div className={cn('flex-1 pb-6', isLast && 'pb-0')}>
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <p className="text-sm font-semibold text-brand-foreground">{STATUS_LABELS[history.status] ?? history.status}</p>
                      <time className="text-xs text-gray-500">{formatDate(history.created_at, true)}</time>
                    </div>
                    <p className="mt-1 text-xs leading-5 text-gray-600">{history.note || STATUS_DESCRIPTIONS[history.status]}</p>
                  </div>
                </li>
              )
            })}
          </ol>

          <p className="mt-5 rounded-xl bg-brand-muted/40 px-4 py-3 text-xs leading-5 text-gray-600">
            Cette page s’actualise automatiquement toutes les 30 secondes pour afficher le dernier statut disponible.
          </p>
        </section>

        <div className="space-y-5">
          <section className="rounded-2xl border border-brand-border bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2"><MapPin size={18} className="text-primary" /><h2 className="font-bold text-brand-foreground">Trajet</h2></div>
            <div className="space-y-4">
              <AddressBlock label="Enlèvement" name={delivery.sender_name} phone={delivery.sender_phone} address={delivery.pickup_address} />
              <div className="ml-2 h-5 border-l-2 border-dashed border-brand-border" />
              <AddressBlock label="Destination" name={delivery.recipient_name} phone={delivery.recipient_phone} address={delivery.delivery_address} destination />
            </div>
            {delivery.distance && <p className="mt-4 text-xs text-gray-500">Distance estimée : {Number(delivery.distance).toFixed(1)} km</p>}
          </section>

          {delivery.driver && (
            <section className="rounded-2xl border border-brand-border bg-white p-5 shadow-sm">
              <div className="mb-3 flex items-center gap-2"><User size={18} className="text-primary" /><h2 className="font-bold text-brand-foreground">Votre livreur</h2></div>
              <p className="text-sm font-semibold text-brand-foreground">{delivery.driver.name}</p>
              <a href={`tel:${delivery.driver.phone}`} className="mt-1 flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"><Phone size={12} /> {delivery.driver.phone}</a>
            </section>
          )}

          <section className="rounded-2xl border border-brand-border bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2"><Package size={18} className="text-primary" /><h2 className="font-bold text-brand-foreground">Détails</h2></div>
            <dl className="space-y-2.5 text-sm">
              <Detail label="Type" value={PACKAGE_LABELS[delivery.package_type] ?? delivery.package_type} />
              <Detail label="Contenu" value={CONTENT_LABELS[delivery.content_category] ?? delivery.content_category} />
              {delivery.package_weight && <Detail label="Poids estimé" value={`${delivery.package_weight} kg`} />}
              <Detail label="Service" value={delivery.delivery_type === 'express' ? 'Express (2–4 h)' : 'Standard (24–48 h)'} />
              <Detail label="Prix" value={formatPrice(delivery.price)} strong />
            </dl>
            {delivery.package_description && <p className="mt-4 rounded-xl bg-brand-muted/40 p-3 text-xs leading-5 text-gray-600">{delivery.package_description}</p>}
          </section>

          {delivery.payment && (
            <section className="rounded-2xl border border-brand-border bg-white p-5 shadow-sm">
              <div className="mb-3 flex items-center gap-2"><CreditCard size={18} className="text-primary" /><h2 className="font-bold text-brand-foreground">Paiement</h2></div>
              <Detail label="Mode" value={PAYMENT_LABELS[delivery.payment.method] ?? delivery.payment.method} />
              <div className="mt-2"><Detail label="État" value={delivery.payment.status === 'succeeded' ? 'Payé' : 'En attente'} strong /></div>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}

function AddressBlock({ label, name, phone, address, destination = false }: { label: string; name: string; phone: string; address: string; destination?: boolean }) {
  return (
    <div className="flex gap-3">
      <span className={cn('mt-1 h-4 w-4 shrink-0 rounded-full border-4 border-white ring-2', destination ? 'bg-secondary ring-secondary/30' : 'bg-primary ring-primary/30')} />
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm font-semibold text-brand-foreground">{name}</p>
        <p className="mt-0.5 text-xs leading-5 text-gray-600">{address}</p>
        <a href={`tel:${phone}`} className="mt-1 inline-flex items-center gap-1 text-xs text-primary hover:underline"><Phone size={11} /> {phone}</a>
      </div>
    </div>
  )
}

function Detail({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="text-gray-500">{label}</dt>
      <dd className={cn('text-right text-brand-foreground', strong && 'font-bold text-primary')}>{value}</dd>
    </div>
  )
}
