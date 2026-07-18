'use client'

import { useEffect, useRef, useState } from 'react'
import { Download } from 'lucide-react'
import StatusBadge from '@/components/status-badge'
import Card from '@/components/card'
import { EmptyState } from '@/components/empty-state'
import SearchInput from '@/components/search-input'
import { getAdminDeliveries } from '@/lib/api/admin'
import { exportRowsToCsv } from '@/lib/export'
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

  // Initial load — le filtre statut peut être pré-rempli via l'URL (?status=…),
  // utilisé par les liens du centre d'alertes
  useEffect(() => {
    const initialStatus = new URLSearchParams(window.location.search).get('status') ?? ''
    setStatusFilter(initialStatus)
    load('', initialStatus)
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

  function handleExport() {
    exportRowsToCsv('speedservice-commandes.csv', [
      { header: 'Référence', value: (row) => row.reference },
      { header: 'Date', value: (row) => formatDate(row.created_at) },
      { header: 'Client', value: (row) => row.client?.name },
      { header: 'Départ', value: (row) => row.from_address },
      { header: 'Arrivée', value: (row) => row.to_address },
      { header: 'Livreur', value: (row) => row.driver?.name },
      { header: 'Statut', value: (row) => row.status },
      { header: 'Montant FCFA', value: (row) => row.amount_xof },
    ], deliveries)
  }

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-foreground">
          Gestion des commandes
        </h1>
        <button
          type="button"
          onClick={handleExport}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/20 hover:text-foreground sm:justify-start"
        >
          <Download size={16} aria-hidden="true" />
          Exporter
        </button>
      </div>

      {/* Search + Filter tabs */}
      <div className="space-y-3">
        <SearchInput
          placeholder="Rechercher une commande, client…"
          value={search}
          onChange={handleSearchChange}
        />
        <label className="block md:hidden">
          <span className="sr-only">Filtrer les commandes par statut</span>
          <select
            value={statusFilter}
            onChange={(event) => handleStatusFilter(event.target.value)}
            className="min-h-11 w-full rounded-xl border border-border bg-input-background px-3 py-2 text-sm font-medium text-foreground transition-colors focus:bg-card"
          >
            {STATUS_FILTERS.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
        </label>
        <div className="hidden flex-wrap gap-2 md:flex">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => handleStatusFilter(f.value)}
              className={cn(
                'min-h-9 rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors',
                statusFilter === f.value
                  ? 'bg-primary text-white'
                  : 'border border-border bg-input-background text-muted-foreground hover:bg-muted/30 hover:text-foreground',
              )}
            >
              {f.label}
            </button>
          ))}
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
                    className="px-5 py-8"
                  >
                    <EmptyState
                      title="Aucune commande trouvée"
                      description="Modifiez la recherche ou le statut pour élargir la liste."
                    />
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
