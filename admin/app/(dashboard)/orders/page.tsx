'use client'

import { useEffect, useRef, useState } from 'react'
import StatusBadge from '@/components/status-badge'
import Card from '@/components/card'
import SearchInput from '@/components/search-input'
import { getAdminDeliveries } from '@/lib/api/admin'
import type { AdminDelivery } from '@/types/admin'
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
  { value: '', label: 'Toutes' },
  { value: 'draft', label: 'Brouillon' },
  { value: 'awaiting_payment', label: 'En attente de paiement' },
  { value: 'awaiting_validation', label: 'En attente de validation' },
  { value: 'confirmed', label: 'Confirmée' },
  { value: 'assigned', label: 'Assignée' },
  { value: 'picking_up', label: 'En cours de récupération' },
  { value: 'in_delivery', label: 'En livraison' },
  { value: 'delivered', label: 'Livrée' },
  { value: 'cancelled', label: 'Annulée' },
]

const TABLE_HEADERS = [
  'Référence',
  'Date',
  'Client',
  'Trajet',
  'Livreur',
  'Statut',
  'Montant',
]

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function OrdersPage() {
  const [deliveries, setDeliveries] = useState<AdminDelivery[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function load(searchValue: string, status: string) {
    setLoading(true)
    getAdminDeliveries({ search: searchValue, status })
      .then((res) => {
        setDeliveries(res.data ?? res)
      })
      .catch((err) => {
        console.error('Erreur chargement commandes', err)
      })
      .finally(() => setLoading(false))
  }

  // Initial load
  useEffect(() => {
    load('', '')
  }, [])

  // Debounced search
  function handleSearchChange(value: string) {
    setSearch(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      load(value, statusFilter)
    }, 300)
  }

  function handleStatusFilter(value: string) {
    setStatusFilter(value)
    load(search, value)
  }

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-5">
      {/* Header */}
      <h1 className="text-2xl font-bold text-foreground">
        Gestion des commandes
      </h1>

      {/* Search + Filter tabs */}
      <div className="space-y-3">
        <SearchInput
          placeholder="Rechercher une commande, client…"
          value={search}
          onChange={handleSearchChange}
        />
        <div className="overflow-x-auto pb-1">
          <div className="flex gap-2 min-w-max">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => handleStatusFilter(f.value)}
                className={cn(
                  'px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors',
                  statusFilter === f.value
                    ? 'bg-primary text-white'
                    : 'bg-input-background border border-border text-muted-foreground hover:bg-muted/30',
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
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
          <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
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
              {deliveries.length === 0 ? (
                <tr>
                  <td
                    colSpan={TABLE_HEADERS.length}
                    className="px-5 py-8 text-center text-muted-foreground text-sm"
                  >
                    Aucune commande trouvée
                  </td>
                </tr>
              ) : (
                deliveries.map((d) => (
                  <tr
                    key={d.id}
                    className="border-b border-border last:border-0 hover:bg-muted/10 transition-colors"
                  >
                    {/* Référence */}
                    <td className="px-5 py-4">
                      <span className="font-mono text-xs text-primary">
                        {d.reference}
                      </span>
                    </td>
                    {/* Date */}
                    <td className="px-5 py-4 text-xs text-muted-foreground whitespace-nowrap">
                      {formatDate(d.created_at)}
                    </td>
                    {/* Client */}
                    <td className="px-5 py-4 text-sm">
                      {d.client?.name ?? '—'}
                    </td>
                    {/* Trajet */}
                    <td className="px-5 py-4 text-xs text-muted-foreground max-w-[180px]">
                      {d.from_address ?? '—'} → {d.to_address ?? '—'}
                    </td>
                    {/* Livreur */}
                    <td className="px-5 py-4 text-sm">
                      {d.driver?.name ?? (
                        <span className="text-muted-foreground text-xs">
                          Non assigné
                        </span>
                      )}
                    </td>
                    {/* Statut */}
                    <td className="px-5 py-4">
                      <StatusBadge status={d.status} />
                    </td>
                    {/* Montant */}
                    <td className="px-5 py-4 text-sm font-semibold whitespace-nowrap">
                      {formatXOF(d.amount_xof ?? 0)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          </div>
        </Card>
      )}
    </div>
  )
}
