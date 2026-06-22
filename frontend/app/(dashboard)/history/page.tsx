'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Filter, Eye, Package } from 'lucide-react'
import { apiGet } from '@/lib/api'
import { StatusBadge } from '@/components/status-badge'

type Delivery = {
  id: string
  reference: string
  status: string
  pickup_address: string
  delivery_address: string
  price: string
  created_at: string
}

const PACKAGE_LABELS: Record<string, string> = {
  document: 'Document',
  small:    'Petit colis',
  medium:   'Colis moyen',
  large:    'Grand colis',
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
}

function formatPrice(raw: string | number) {
  return Number(raw).toLocaleString('fr-FR') + ' FCFA'
}

function shortAddress(addr: string) {
  const parts = addr.split(',')
  return parts[0]?.trim() ?? addr
}

export default function HistoryPage() {
  const router = useRouter()
  const [deliveries, setDeliveries] = useState<Delivery[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiGet<Delivery[]>('/deliveries')
      .then(setDeliveries)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const filtered = deliveries.filter((d) =>
    d.reference.toLowerCase().includes(search.toLowerCase()) ||
    d.pickup_address.toLowerCase().includes(search.toLowerCase()) ||
    d.delivery_address.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="p-6 space-y-5">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-brand-foreground">Historique des livraisons</h2>
        <div className="flex gap-2">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Référence, adresse..."
              className="pl-9 pr-4 py-2 bg-brand-input border border-brand-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-primary-400 w-56"
            />
          </div>
          <button className="flex items-center gap-2 px-3 py-2 bg-brand-input border border-brand-border rounded-xl text-sm text-primary-400 hover:border-primary/40 transition-colors">
            <Filter size={14} /> Filtrer
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-brand-border shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <Package size={28} className="text-primary" />
            </div>
            <p className="text-sm font-semibold text-brand-foreground mb-1">
              {search ? 'Aucun résultat pour cette recherche' : 'Aucune livraison pour l\'instant'}
            </p>
            {!search && (
              <button
                onClick={() => router.push('/new-delivery')}
                className="mt-4 px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-2xl hover:opacity-90 transition-all"
              >
                Créer ma première livraison
              </button>
            )}
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-brand-border bg-brand-muted/20">
                {['Référence', 'Date', 'De → Vers', 'Statut', 'Prix', ''].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-primary-400 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((d) => (
                <tr key={d.id} className="border-b border-brand-border last:border-0 hover:bg-brand-muted/10 transition-colors">
                  <td className="px-5 py-4 text-sm font-mono font-medium text-primary">{d.reference}</td>
                  <td className="px-5 py-4 text-sm text-primary-400">{formatDate(d.created_at)}</td>
                  <td className="px-5 py-4 text-sm text-brand-foreground">
                    {shortAddress(d.pickup_address)} → {shortAddress(d.delivery_address)}
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={d.status} />
                  </td>
                  <td className="px-5 py-4 text-sm font-semibold text-brand-foreground">{formatPrice(d.price)}</td>
                  <td className="px-5 py-4">
                    <button className="flex items-center gap-1 text-xs text-primary font-medium hover:underline">
                      <Eye size={12} /> Voir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
