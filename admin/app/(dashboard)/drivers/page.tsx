'use client'

import { useEffect, useState } from 'react'
import { Truck, MoreHorizontal, UserCheck } from 'lucide-react'
import Card from '@/components/card'
import SearchInput from '@/components/search-input'
import { getAdminDrivers, toggleDriverActive } from '@/lib/api/admin'
import type { AdminDriver } from '@/types/admin'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const TABLE_HEADERS = [
  'Livreur',
  'Téléphone',
  'Zone',
  'Livraisons',
  'Statut',
  'Actions',
]

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

interface DriverStatusBadgeProps {
  driver: AdminDriver
}

function DriverStatusBadge({ driver }: DriverStatusBadgeProps) {
  if (driver.is_active === false) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700">
        Inactif
      </span>
    )
  }
  if (driver.online_status === 'online') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-50 text-green-700">
        <span className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
        En ligne
      </span>
    )
  }
  if (driver.online_status === 'on_mission') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
        En mission
      </span>
    )
  }
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-muted text-muted-foreground">
      Hors ligne
    </span>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function DriversPage() {
  const [drivers, setDrivers] = useState<AdminDriver[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [togglingId, setTogglingId] = useState<string | null>(null)

  function load(searchValue: string) {
    setLoading(true)
    getAdminDrivers({ search: searchValue })
      .then((res) => {
        setDrivers(res.data ?? res)
      })
      .catch((err) => {
        console.error('Erreur chargement livreurs', err)
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

  async function handleToggleActive(driver: AdminDriver) {
    setTogglingId(driver.id)
    try {
      const updated = await toggleDriverActive(driver.id, !driver.is_active)
      setDrivers((prev) =>
        prev.map((d) => (d.id === driver.id ? { ...d, ...updated } : d)),
      )
    } catch (err) {
      console.error('Erreur toggle livreur', err)
    } finally {
      setTogglingId(null)
    }
  }

  // Derived stats
  const totalCount = drivers.length
  const onlineCount = drivers.filter(
    (d) => d.online_status === 'online',
  ).length
  const onMissionCount = drivers.filter(
    (d) => d.online_status === 'on_mission',
  ).length

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-2xl font-bold text-foreground">
          Gestion des livreurs
        </h1>
        <button className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-2xl text-sm font-semibold hover:bg-primary/90 transition-colors active:scale-95">
          <UserCheck size={16} />
          Nouveau livreur
        </button>
      </div>

      {/* Mini stat cards */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-card rounded-2xl border border-border p-3 sm:p-5 text-center">
          <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1 leading-tight">
            Total livreurs
          </p>
          <p className="text-2xl sm:text-3xl font-extrabold text-primary">{totalCount}</p>
        </div>
        <div className="bg-card rounded-2xl border border-border p-3 sm:p-5 text-center">
          <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1 leading-tight">
            En ligne
          </p>
          <p className="text-2xl sm:text-3xl font-extrabold text-green-600">{onlineCount}</p>
        </div>
        <div className="bg-card rounded-2xl border border-border p-3 sm:p-5 text-center">
          <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1 leading-tight">
            En mission
          </p>
          <p className="text-2xl sm:text-3xl font-extrabold text-amber-600">
            {onMissionCount}
          </p>
        </div>
      </div>

      {/* Search */}
      <SearchInput
        placeholder="Rechercher un livreur…"
        value={search}
        onChange={handleSearchChange}
      />

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
          <table className="w-full min-w-[520px]">
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
              {drivers.length === 0 ? (
                <tr>
                  <td
                    colSpan={TABLE_HEADERS.length}
                    className="px-5 py-8 text-center text-muted-foreground text-sm"
                  >
                    Aucun livreur trouvé
                  </td>
                </tr>
              ) : (
                drivers.map((d) => (
                  <tr
                    key={d.id}
                    className="border-b border-border last:border-0 hover:bg-muted/10 transition-colors"
                  >
                    {/* Livreur */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                          <Truck size={14} className="text-amber-600" />
                        </div>
                        <span className="text-sm font-semibold">{d.name}</span>
                      </div>
                    </td>
                    {/* Téléphone */}
                    <td className="px-5 py-4 text-sm text-muted-foreground">
                      {d.phone ?? '—'}
                    </td>
                    {/* Zone */}
                    <td className="px-5 py-4 text-sm">{d.city ?? 'Cotonou'}</td>
                    {/* Livraisons */}
                    <td className="px-5 py-4 text-sm font-semibold">
                      {d.deliveries_completed ?? 0}
                    </td>
                    {/* Statut */}
                    <td className="px-5 py-4">
                      <DriverStatusBadge driver={d} />
                    </td>
                    {/* Actions */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5">
                        <button
                          className="p-1.5 rounded-lg hover:bg-muted/30 transition-colors"
                          title="Plus d'actions"
                        >
                          <MoreHorizontal
                            size={15}
                            className="text-muted-foreground"
                          />
                        </button>
                        <button
                          onClick={() => handleToggleActive(d)}
                          disabled={togglingId === d.id}
                          className={cn(
                            'px-2.5 py-1 rounded-xl text-xs font-semibold transition-colors active:scale-95 disabled:opacity-50',
                            d.is_active === false
                              ? 'bg-green-50 text-green-700 hover:bg-green-100'
                              : 'bg-red-50 text-red-700 hover:bg-red-100',
                          )}
                        >
                          {togglingId === d.id
                            ? '…'
                            : d.is_active === false
                              ? 'Activer'
                              : 'Désactiver'}
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
