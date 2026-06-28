'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { User, Eye, Edit } from 'lucide-react'
import Card from '@/components/card'
import SearchInput from '@/components/search-input'
import { getAdminUsers } from '@/lib/api/admin'
import type { AdminUser } from '@/types/admin'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatXOF(amount: number): string {
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}M FCFA`
  return `${amount.toLocaleString('fr-FR')} FCFA`
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    month: 'short',
    year: 'numeric',
  })
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const TABLE_HEADERS = [
  'Client',
  'Téléphone',
  'Ville',
  'Commandes',
  'Total dépensé',
  'Depuis',
  'Statut',
  'Actions',
]

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function ClientsPage() {
  const router = useRouter()
  const [clients, setClients] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  function load(searchValue: string) {
    setLoading(true)
    getAdminUsers({ role: 'client', search: searchValue })
      .then((res) => {
        const data: AdminUser[] = res.data ?? res
        setClients(data.filter((u) => u.role === 'client'))
      })
      .catch((err) => {
        console.error('Erreur chargement clients', err)
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load('')
  }, [])

  function handleSearchChange(value: string) {
    setSearch(value)
    load(value)
  }

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-foreground shrink-0">
          Gestion des clients
        </h1>
        <div className="w-full sm:w-72">
          <SearchInput
            placeholder="Rechercher un client…"
            value={search}
            onChange={handleSearchChange}
          />
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
          <table className="w-full min-w-[680px]">
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
              {clients.length === 0 ? (
                <tr>
                  <td
                    colSpan={TABLE_HEADERS.length}
                    className="px-5 py-8 text-center text-muted-foreground text-sm"
                  >
                    Aucun client trouvé
                  </td>
                </tr>
              ) : (
                clients.map((c) => (
                  <tr
                    key={c.id}
                    className="border-b border-border last:border-0 hover:bg-muted/10 transition-colors"
                  >
                    {/* Client */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                          <User size={14} className="text-primary" />
                        </div>
                        <span className="text-sm font-semibold">{c.name}</span>
                      </div>
                    </td>
                    {/* Téléphone */}
                    <td className="px-5 py-4 text-sm text-muted-foreground">
                      {c.phone ?? '—'}
                    </td>
                    {/* Ville */}
                    <td className="px-5 py-4 text-sm">{c.city ?? '—'}</td>
                    {/* Commandes */}
                    <td className="px-5 py-4 text-sm text-primary font-semibold">
                      {c.deliveries_count ?? 0}
                    </td>
                    {/* Total dépensé */}
                    <td className="px-5 py-4 text-sm font-semibold">
                      {formatXOF(c.total_spent_xof ?? 0)}
                    </td>
                    {/* Depuis */}
                    <td className="px-5 py-4 text-xs text-muted-foreground">
                      {formatDate(c.created_at)}
                    </td>
                    {/* Statut */}
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-50 text-green-700">
                        Actif
                      </span>
                    </td>
                    {/* Actions */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => router.push(`/clients/${c.id}`)}
                          className="p-1.5 rounded-lg hover:bg-muted/30 transition-colors"
                          title="Voir le profil"
                        >
                          <Eye size={15} className="text-muted-foreground" />
                        </button>
                        <button
                          className="p-1.5 rounded-lg hover:bg-muted/30 transition-colors"
                          title="Modifier"
                        >
                          <Edit size={15} className="text-muted-foreground" />
                        </button>
                      </div>
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
