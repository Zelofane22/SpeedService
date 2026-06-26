'use client'

import { useEffect, useState } from 'react'
import { Download } from 'lucide-react'
import Card from '@/components/card'
import { getAdminPayments, validatePayment } from '@/lib/api/admin'
import type { AdminPayment } from '@/types/admin'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatXOF(amount: number): string {
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}M FCFA`
  return `${amount.toLocaleString('fr-FR')} FCFA`
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STATUS_FILTERS = [
  { value: '', label: 'Tous' },
  { value: 'success', label: 'Réussi' },
  { value: 'pending', label: 'En attente' },
  { value: 'failed', label: 'Échoué' },
]

const PHYSICAL_METHODS = [
  'CashOnDelivery',
  'Agency',
  'Paiement à la livraison',
  'Paiement en agence',
  'cash_on_delivery',
  'agency',
]

const TABLE_HEADERS = [
  'Référence',
  'Commande',
  'Client',
  'Méthode',
  'Montant',
  'Date',
  'Statut',
  'Actions',
]

// ---------------------------------------------------------------------------
// Status badge
// ---------------------------------------------------------------------------

function PaymentStatusBadge({ status }: { status: string }) {
  if (status === 'success') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-50 text-green-700">
        <span className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
        Réussi
      </span>
    )
  }
  if (status === 'pending') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
        En attente
      </span>
    )
  }
  if (status === 'failed') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-500">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
        Échoué
      </span>
    )
  }
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-muted text-muted-foreground">
      {status}
    </span>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function PaymentsPage() {
  const [payments, setPayments] = useState<AdminPayment[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [validatingId, setValidatingId] = useState<string | null>(null)

  function load(status: string) {
    setLoading(true)
    getAdminPayments({ status })
      .then((res) => {
        setPayments(res.data ?? res)
      })
      .catch((err) => {
        console.error('Erreur chargement paiements', err)
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load('')
  }, [])

  function handleStatusFilter(value: string) {
    setStatusFilter(value)
    load(value)
  }

  async function handleValidatePayment(payment: AdminPayment) {
    const paymentId = payment.id
    setValidatingId(paymentId)
    try {
      await validatePayment(payment.delivery_id)
      load(statusFilter)
    } catch (err) {
      console.error('Erreur validation paiement', err)
    } finally {
      setValidatingId(null)
    }
  }

  // Derived stats
  const totalCollected = payments
    .filter((p) => p.status === 'success')
    .reduce((sum, p) => sum + (p.amount_xof ?? 0), 0)

  const totalPending = payments
    .filter((p) => p.status === 'pending')
    .reduce((sum, p) => sum + (p.amount_xof ?? 0), 0)

  const totalFailed = payments
    .filter((p) => p.status === 'failed')
    .reduce((sum, p) => sum + (p.amount_xof ?? 0), 0)

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-2xl font-bold text-foreground">
          Gestion des paiements
        </h1>
        <button className="inline-flex items-center gap-2 border border-border rounded-xl px-4 py-2 text-sm text-muted-foreground hover:bg-muted/20 transition-colors">
          <Download size={16} />
          Exporter
        </button>
      </div>

      {/* Mini stat cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card rounded-2xl border border-border p-5 text-center">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
            Total collecté
          </p>
          <p className="text-xl font-extrabold text-green-600">
            {formatXOF(totalCollected)}
          </p>
        </div>
        <div className="bg-card rounded-2xl border border-border p-5 text-center">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
            En attente
          </p>
          <p className="text-xl font-extrabold text-amber-600">
            {formatXOF(totalPending)}
          </p>
        </div>
        <div className="bg-card rounded-2xl border border-border p-5 text-center">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
            Échoués
          </p>
          <p className="text-xl font-extrabold text-red-500">
            {formatXOF(totalFailed)}
          </p>
        </div>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-2">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => handleStatusFilter(f.value)}
            className={cn(
              'px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors',
              statusFilter === f.value
                ? 'bg-primary text-white'
                : 'bg-input-background border border-border text-muted-foreground hover:bg-muted/30',
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Loading skeleton */}
      {loading ? (
        <div className="p-6 space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-12 bg-muted animate-pulse rounded-xl" />
          ))}
        </div>
      ) : (
        <Card className="overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/20 border-b border-border">
                {TABLE_HEADERS.map((h) => (
                  <th
                    key={h}
                    className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {payments.length === 0 ? (
                <tr>
                  <td
                    colSpan={TABLE_HEADERS.length}
                    className="px-5 py-8 text-center text-muted-foreground text-sm"
                  >
                    Aucun paiement trouvé
                  </td>
                </tr>
              ) : (
                payments.map((p) => {
                  const isPhysical = PHYSICAL_METHODS.includes(p.method ?? '')
                  const canValidate = p.status === 'pending' && isPhysical

                  return (
                    <tr
                      key={p.id}
                      className="border-b border-border last:border-0 hover:bg-muted/10 transition-colors"
                    >
                      {/* Référence */}
                      <td className="px-5 py-4">
                        <span className="font-mono text-xs">{p.reference}</span>
                      </td>
                      {/* Commande */}
                      <td className="px-5 py-4">
                        <span className="font-mono text-xs text-primary">
                          {p.delivery_reference ?? '—'}
                        </span>
                      </td>
                      {/* Client */}
                      <td className="px-5 py-4 text-sm">
                        {p.client_name ?? '—'}
                      </td>
                      {/* Méthode */}
                      <td className="px-5 py-4 text-sm text-muted-foreground">
                        {p.method ?? '—'}
                      </td>
                      {/* Montant */}
                      <td className="px-5 py-4 text-sm font-bold">
                        {formatXOF(p.amount_xof ?? 0)}
                      </td>
                      {/* Date */}
                      <td className="px-5 py-4 text-xs text-muted-foreground whitespace-nowrap">
                        {formatDate(p.date)}
                      </td>
                      {/* Statut */}
                      <td className="px-5 py-4">
                        <PaymentStatusBadge status={p.status} />
                      </td>
                      {/* Actions */}
                      <td className="px-5 py-4">
                        {canValidate && (
                          <button
                            onClick={() => handleValidatePayment(p)}
                            disabled={validatingId === p.id}
                            className="px-3 py-1.5 bg-green-500 text-white text-xs font-semibold rounded-xl hover:bg-green-600 active:scale-95 transition-all disabled:opacity-50"
                          >
                            {validatingId === p.id
                              ? '…'
                              : 'Valider le paiement'}
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  )
}
