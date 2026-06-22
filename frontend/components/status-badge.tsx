import { cn } from '@/lib/utils'

type Config = { label: string; bg: string; text: string; dot: string }

const statusConfig: Record<string, Config> = {
  // API enum values (backend)
  draft:                { label: 'Brouillon',                bg: 'bg-gray-100',   text: 'text-gray-600',   dot: 'bg-gray-400' },
  awaiting_payment:     { label: 'En attente de paiement',   bg: 'bg-gray-100',   text: 'text-gray-600',   dot: 'bg-gray-400' },
  awaiting_validation:  { label: 'En attente de validation', bg: 'bg-purple-50',  text: 'text-purple-700', dot: 'bg-purple-400' },
  confirmed:            { label: 'Confirmée',                bg: 'bg-blue-50',    text: 'text-blue-700',   dot: 'bg-blue-500' },
  assigned:             { label: 'Assignée',                 bg: 'bg-blue-50',    text: 'text-blue-700',   dot: 'bg-blue-400' },
  picking_up:           { label: 'En cours de récupération', bg: 'bg-amber-50',   text: 'text-amber-700',  dot: 'bg-amber-400' },
  in_delivery:          { label: 'En livraison',             bg: 'bg-amber-50',   text: 'text-amber-700',  dot: 'bg-amber-500' },
  delivered:            { label: 'Livrée',                   bg: 'bg-green-50',   text: 'text-green-700',  dot: 'bg-green-500' },
  cancelled:            { label: 'Annulée',                  bg: 'bg-red-50',     text: 'text-red-700',    dot: 'bg-red-500' },
}

export function StatusBadge({ status }: { status: string }) {
  const c = statusConfig[status] ?? { label: status, bg: 'bg-gray-50', text: 'text-gray-700', dot: 'bg-gray-400' }
  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold', c.bg, c.text)}>
      <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', c.dot)} />
      {c.label}
    </span>
  )
}
