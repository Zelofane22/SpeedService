'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Check, ChevronLeft, ChevronRight, MapPin, Phone, User,
  Clock, Zap, CreditCard, Package,
} from 'lucide-react'
import { apiPost } from '@/lib/api'
import { cn } from '@/lib/utils'
import MapPicker, { type GeoPoint } from '@/components/map-picker'
import RouteMap from '@/components/route-map'

// ─── Types ───────────────────────────────────────────────────────────────────

type Form = {
  sender_name: string
  sender_phone: string
  pickup_address: string
  pickup_point: GeoPoint | null

  recipient_name: string
  recipient_phone: string
  delivery_address: string
  delivery_point: GeoPoint | null

  package_type: string
  content_category: string
  package_description: string
  package_weight: string
  delivery_type: 'standard' | 'express'
  payment_method: string
}

// ─── Haversine distance (km) ──────────────────────────────────────────────────

function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

// ─── Price table ──────────────────────────────────────────────────────────────

const BASE_PRICES: Record<string, number> = {
  document: 1500,
  small:    2500,
  medium:   4000,
  large:    6500,
}

function calcPrice(packageType: string, deliveryType: 'standard' | 'express'): number {
  const base = BASE_PRICES[packageType] ?? 2500
  return deliveryType === 'express' ? base * 2 : base
}

function fmtPrice(n: number) {
  return n.toLocaleString('fr-FR') + ' FCFA'
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function FieldInput({
  label, name, value, onChange, type = 'text', placeholder, icon: Icon, required = false,
}: {
  label: string
  name: string
  value: string
  onChange: (v: string) => void
  type?: string
  placeholder?: string
  icon?: React.ElementType
  required?: boolean
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-brand-foreground">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <div className="relative">
        {Icon && <Icon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-primary-400" />}
        <input
          type={type}
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cn(
            'w-full bg-brand-input border border-brand-border rounded-2xl py-3 pr-4 text-sm',
            'placeholder:text-primary-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all',
            Icon ? 'pl-10' : 'pl-4',
          )}
        />
      </div>
    </div>
  )
}

function FieldSelect({
  label, name, value, onChange, options, required = false,
}: {
  label: string
  name: string
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
  required?: boolean
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-brand-foreground">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <div className="relative">
        <select
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none bg-brand-input border border-brand-border rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all pr-10"
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <ChevronRight size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 rotate-90 text-primary-400 pointer-events-none" />
      </div>
    </div>
  )
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STEPS = ['Expéditeur', 'Destinataire', 'Colis', 'Récapitulatif', 'Paiement']

const PACKAGE_TYPES = [
  { value: 'document', label: 'Document (< 0,5 kg) — 1 500 FCFA' },
  { value: 'small',    label: 'Petit colis (0,5–2 kg) — 2 500 FCFA' },
  { value: 'medium',   label: 'Colis moyen (2–5 kg) — 4 000 FCFA' },
  { value: 'large',    label: 'Grand colis (5–10 kg) — 6 500 FCFA' },
]

const CATEGORIES = [
  { value: 'document',    label: 'Documents & Papiers' },
  { value: 'clothing',    label: 'Vêtements & Textile' },
  { value: 'electronics', label: 'Électronique' },
  { value: 'food',        label: 'Alimentaire' },
  { value: 'other',       label: 'Autres' },
]

const PAYMENT_METHODS = [
  { value: 'mtn_momo',         label: 'MTN MoMo',               desc: 'Paiement mobile rapide' },
  { value: 'moov_money',       label: 'Moov Money',             desc: 'Paiement mobile sécurisé' },
  { value: 'card',             label: 'Carte bancaire',         desc: 'Visa, Mastercard' },
  { value: 'cash_on_delivery', label: 'Paiement à la livraison', desc: 'En espèces à la réception' },
  { value: 'agency',           label: 'Paiement en agence',     desc: 'Espèces dans une agence partenaire' },
]

const PACKAGE_LABELS: Record<string, string> = {
  document: 'Document',
  small:    'Petit colis',
  medium:   'Colis moyen',
  large:    'Grand colis',
}

type CreatedDelivery = { id: string }

// ─── Page ────────────────────────────────────────────────────────────────────

export default function NewDeliveryPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState<Form>({
    sender_name: '', sender_phone: '', pickup_address: '', pickup_point: null,
    recipient_name: '', recipient_phone: '', delivery_address: '', delivery_point: null,
    package_type: 'small', content_category: 'other',
    package_description: '', package_weight: '',
    delivery_type: 'standard', payment_method: 'mtn_momo',
  })

  function set<K extends keyof Form>(field: K, value: Form[K]) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  function handlePickupPoint(pt: GeoPoint) {
    set('pickup_point', pt)
    set('pickup_address', pt.address)
  }

  function handleDeliveryPoint(pt: GeoPoint) {
    set('delivery_point', pt)
    set('delivery_address', pt.address)
  }

  const distance: number | null =
    form.pickup_point && form.delivery_point
      ? haversine(
          form.pickup_point.lat, form.pickup_point.lon,
          form.delivery_point.lat, form.delivery_point.lon,
        ) * 1.3
      : null

  function validateStep(): string | null {
    if (step === 0) {
      if (!form.sender_name.trim())    return "Le nom de l'expéditeur est requis."
      if (!form.sender_phone.trim())   return "Le téléphone de l'expéditeur est requis."
      if (!form.pickup_point)          return 'Veuillez sélectionner le point de collecte sur la carte.'
    }
    if (step === 1) {
      if (!form.recipient_name.trim()) return 'Le nom du destinataire est requis.'
      if (!form.recipient_phone.trim()) return 'Le téléphone du destinataire est requis.'
      if (!form.delivery_point)        return 'Veuillez sélectionner le point de livraison sur la carte.'
    }
    return null
  }

  function next() {
    const err = validateStep()
    if (err) { setError(err); return }
    setError(null)
    setStep((s) => s + 1)
  }

  function back() {
    setError(null)
    setStep((s) => s - 1)
  }

  async function submit() {
    setLoading(true)
    setError(null)
    try {
      const data = await apiPost<CreatedDelivery>('/deliveries', {
        sender_name:          form.sender_name,
        sender_phone:         form.sender_phone,
        pickup_address:       form.pickup_address,
        pickup_latitude:      form.pickup_point?.lat ?? null,
        pickup_longitude:     form.pickup_point?.lon ?? null,
        recipient_name:       form.recipient_name,
        recipient_phone:      form.recipient_phone,
        delivery_address:     form.delivery_address,
        delivery_latitude:    form.delivery_point?.lat ?? null,
        delivery_longitude:   form.delivery_point?.lon ?? null,
        distance:             distance ? parseFloat(distance.toFixed(2)) : null,
        package_type:         form.package_type,
        content_category:     form.content_category,
        package_description:  form.package_description || null,
        package_weight:       form.package_weight ? parseFloat(form.package_weight) : null,
        delivery_type:        form.delivery_type,
        payment_method:       form.payment_method,
      }, true)
      router.push(`/deliveries/${data.id}/payment`)
    } catch (e: unknown) {
      const err = e as Error & { errors?: Record<string, string[]> }
      setError(err.message ?? 'Une erreur est survenue.')
    } finally {
      setLoading(false)
    }
  }

  const price = calcPrice(form.package_type, form.delivery_type)

  // ── Wizard ─────────────────────────────────────────────────────────────────
  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* Stepper */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-1">
                <div
                  className={cn(
                    'w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all',
                    i < step   ? 'bg-primary text-white' :
                    i === step ? 'bg-primary text-white ring-4 ring-primary/20' :
                                 'bg-brand-muted text-primary-400',
                  )}
                >
                  {i < step ? <Check size={16} /> : i + 1}
                </div>
                <span className={cn('text-xs font-medium hidden sm:block', i === step ? 'text-primary' : 'text-primary-400')}>
                  {label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={cn('flex-1 h-px mx-2 mt-[-20px]', i < step ? 'bg-primary' : 'bg-brand-border')} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Card */}
      <div className="bg-white rounded-2xl border border-brand-border shadow-sm p-8">

        {/* Step 0: Sender + Pickup map */}
        {step === 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-brand-foreground mb-6">Informations expéditeur</h2>
            <FieldInput label="Nom complet" name="sender_name" value={form.sender_name} onChange={(v) => set('sender_name', v)} placeholder="Koffi Mensah" icon={User} required />
            <FieldInput label="Téléphone" name="sender_phone" value={form.sender_phone} onChange={(v) => set('sender_phone', v)} placeholder="+229 97 00 00 00" type="tel" icon={Phone} required />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-brand-foreground">
                Point de collecte <span className="text-red-500">*</span>
              </label>
              <MapPicker
                value={form.pickup_point}
                onChange={handlePickupPoint}
                label="Recherchez ou cliquez sur la carte pour placer le point d'enlèvement"
              />
            </div>
          </div>
        )}

        {/* Step 1: Recipient + Delivery map */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-brand-foreground mb-6">Informations destinataire</h2>
            <FieldInput label="Nom du destinataire" name="recipient_name" value={form.recipient_name} onChange={(v) => set('recipient_name', v)} placeholder="Aïcha Bah" icon={User} required />
            <FieldInput label="Téléphone" name="recipient_phone" value={form.recipient_phone} onChange={(v) => set('recipient_phone', v)} placeholder="+229 97 11 11 11" type="tel" icon={Phone} required />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-brand-foreground">
                Point de livraison <span className="text-red-500">*</span>
              </label>
              <MapPicker
                value={form.delivery_point}
                onChange={handleDeliveryPoint}
                label="Recherchez ou cliquez sur la carte pour placer le point de livraison"
              />
            </div>
          </div>
        )}

        {/* Step 2: Package */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-brand-foreground mb-6">Détails du colis</h2>
            <FieldSelect
              label="Type de colis" name="package_type" value={form.package_type}
              onChange={(v) => set('package_type', v)} options={PACKAGE_TYPES} required
            />
            <FieldSelect
              label="Catégorie de contenu" name="content_category" value={form.content_category}
              onChange={(v) => set('content_category', v)} options={CATEGORIES} required
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-brand-foreground">Description du contenu</label>
              <textarea
                value={form.package_description}
                onChange={(e) => set('package_description', e.target.value)}
                placeholder="Vêtements, documents, électronique..."
                className="w-full bg-brand-input border border-brand-border rounded-2xl px-4 py-3 text-sm placeholder:text-primary-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none h-24 transition-all"
              />
            </div>
            <FieldInput label="Poids estimé (kg)" name="package_weight" value={form.package_weight} onChange={(v) => set('package_weight', v)} placeholder="2.5" type="number" icon={Package} />
          </div>
        )}

        {/* Step 3: Recap + Route map */}
        {step === 3 && (
          <div className="space-y-5">
            <h2 className="text-xl font-bold text-brand-foreground mb-6">Récapitulatif</h2>

            {/* Route map */}
            {form.pickup_point && form.delivery_point && distance !== null && (
              <RouteMap
                pickup={form.pickup_point}
                delivery={form.delivery_point}
                distanceKm={distance}
              />
            )}

            <div className="grid grid-cols-2 gap-3">
              {[
                { l: 'Expéditeur',          v: form.sender_name },
                { l: 'Tél. expéditeur',     v: form.sender_phone },
                { l: 'Adresse de collecte', v: form.pickup_address },
                { l: 'Destinataire',         v: form.recipient_name },
                { l: 'Tél. destinataire',   v: form.recipient_phone },
                { l: 'Adresse de livraison', v: form.delivery_address },
                { l: 'Type de colis',        v: PACKAGE_LABELS[form.package_type] ?? form.package_type },
                { l: 'Poids',               v: form.package_weight ? `${form.package_weight} kg` : 'Non renseigné' },
              ].map(({ l, v }) => (
                <div key={l} className="bg-brand-muted/30 rounded-2xl p-4">
                  <p className="text-xs text-primary-400 mb-1">{l}</p>
                  <p className="text-sm font-semibold text-brand-foreground">{v}</p>
                </div>
              ))}
            </div>
            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5">
              <p className="text-xs text-primary-400 mb-3">Le service (Standard / Express) sera sélectionné à l&apos;étape suivante.</p>
              <div className="flex justify-between items-center text-sm">
                <span className="text-primary-400">Tarif Standard estimé</span>
                <span className="font-medium">{fmtPrice(BASE_PRICES[form.package_type] ?? 2500)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Service + Payment */}
        {step === 4 && (
          <div className="space-y-5">
            <h2 className="text-xl font-bold text-brand-foreground">Choisir le service</h2>
            <div className="space-y-3">
              {([
                { id: 'standard', label: 'Livraison Standard', delay: '24-48 heures', Icon: Clock },
                { id: 'express',  label: 'Livraison Express',  delay: '2-4 heures',  Icon: Zap },
              ] as const).map(({ id, label, delay, Icon }) => (
                <label
                  key={id}
                  onClick={() => set('delivery_type', id)}
                  className={cn(
                    'flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all',
                    form.delivery_type === id ? 'border-primary bg-primary/5' : 'border-brand-border hover:border-primary/40',
                  )}
                >
                  <input type="radio" name="delivery_type" checked={form.delivery_type === id} onChange={() => set('delivery_type', id)} className="accent-primary" />
                  <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', form.delivery_type === id ? 'bg-primary' : 'bg-brand-muted')}>
                    <Icon size={18} className={form.delivery_type === id ? 'text-white' : 'text-primary-400'} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-brand-foreground">{label}</p>
                    <p className="text-xs text-primary-400">{delay}</p>
                  </div>
                  <p className="text-sm font-bold text-primary">{fmtPrice(calcPrice(form.package_type, id))}</p>
                </label>
              ))}
            </div>

            <h2 className="text-xl font-bold text-brand-foreground pt-2">Mode de paiement</h2>
            <div className="space-y-3">
              {PAYMENT_METHODS.map((m) => (
                <label
                  key={m.value}
                  onClick={() => set('payment_method', m.value)}
                  className={cn(
                    'flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all',
                    form.payment_method === m.value ? 'border-primary bg-primary/5' : 'border-brand-border hover:border-primary/40',
                  )}
                >
                  <input type="radio" name="payment_method" checked={form.payment_method === m.value} onChange={() => set('payment_method', m.value)} className="accent-primary" />
                  <div className="w-10 h-10 rounded-xl bg-brand-muted flex items-center justify-center shrink-0">
                    <CreditCard size={18} className="text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-brand-foreground">{m.label}</p>
                    <p className="text-xs text-primary-400">{m.desc}</p>
                  </div>
                </label>
              ))}
            </div>

            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5">
              <div className="flex justify-between items-center text-sm mb-2">
                <span className="text-primary-400">Service</span>
                <span className="font-medium">{form.delivery_type === 'express' ? 'Express' : 'Standard'}</span>
              </div>
              {distance !== null && (
                <div className="flex justify-between items-center text-sm mb-2">
                  <span className="text-primary-400">Distance estimée</span>
                  <span className="font-medium">{distance.toFixed(1)} km</span>
                </div>
              )}
              <div className="border-t border-primary/15 pt-3 flex justify-between items-center">
                <span className="font-bold text-brand-foreground">Total</span>
                <span className="text-xl font-extrabold text-primary">{fmtPrice(price)}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="mt-4 px-4 py-3 bg-red-50 border border-red-200 rounded-2xl text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-3 mt-6">
        {step > 0 && (
          <button
            onClick={back}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 border-2 border-primary text-primary text-sm font-semibold rounded-2xl hover:bg-primary/5 transition-all"
          >
            <ChevronLeft size={16} /> Retour
          </button>
        )}
        {step < STEPS.length - 1 ? (
          <button
            onClick={next}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white text-sm font-semibold rounded-2xl hover:opacity-90 transition-all shadow-lg shadow-primary/25"
          >
            Continuer <ChevronRight size={16} />
          </button>
        ) : (
          <button
            onClick={submit}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white text-sm font-semibold rounded-2xl hover:opacity-90 disabled:opacity-60 transition-all shadow-lg shadow-primary/25"
          >
            {loading ? 'Envoi en cours…' : <><Check size={16} /> Confirmer la commande</>}
          </button>
        )}
      </div>
    </div>
  )
}
